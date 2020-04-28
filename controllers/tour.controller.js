const Tour = require('../models/tour.model');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const factory = require('./handler-factory');

// Greater then Query object in mongoDB: { duration: {$gte: 5}, difficulty: 'easy'}
// result from req.params: { duration: { gte: '5' }, difficulty: 'easy' }
// words to look for and add in query with '$': gte, gt, lte, lt

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // let query = Tour.find(JSON.parse(queryString)); // find method returns a query Obj. That why we can chain f()

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    // will set content-type: application/json automatically
    status: 'success',
    requestedAt: req.requestTime, // req.requestTime was added in MW f()
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

/*exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with ID: ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});*/

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // stages can be used multiple times
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null, // no making of groups
        // _id: {$toUpper: '$difficulty'} , // uppercase group name
        _id: '$difficulty', // making groups by column name. Group name (e.g. - EASY) now becomes its ID
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, // ascending
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = async (req, res) => {
  const year = +req.params.year;

  try {
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // if 1 document has array with 3 startDates, then 3 documents are created - 1 per date
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          amountOfTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, // id will not be shown in results
        },
      },
      {
        $sort: { amountOfTours: -1 }, // descending
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    const message = err.message || 'Invalid data sent';
    res.status(400).json({
      status: 'failed',
      message,
    });
  }
};
