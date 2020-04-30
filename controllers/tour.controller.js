const Tour = require('../models/tour.model');
const catchAsync = require('../utils/catch-async');
const factory = require('./handler-factory');
const AppError = require('../utils/app-error');

// Greater then Query object in mongoDB: { duration: {$gte: 5}, difficulty: 'easy'}
// result from req.params: { duration: { gte: '5' }, difficulty: 'easy' }
// words to look for and add in query with '$': gte, gt, lte, lt

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// URL dor getting tours with duration >= 7: {{URL}}/api/v1/tours?duration[gte]=7&sort=price
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

// testing url: {{URL}}/api/v1/tours/tours-within/200/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!['mi', 'km'].includes(unit)) {
    return next(new AppError('Please indicate either "km" or "mi" units', 400));
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError('Please provide latitude and longitude parameters', 400)
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!['mi', 'km'].includes(unit)) {
    return next(new AppError('Please indicate either "km" or "mi" units', 400));
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError('Please provide latitude and longitude parameters', 400)
    );
  }

  const distances = await Tour.aggregate([
    {
      // this stage always needs to be the first stage
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      // will return only this fields
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

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
