const Tour = require('../models/tour.model');
const APIFeatures = require('../utils/api-features');

// Greater then Query object in mongoDB: { duration: {$gte: 5}, difficulty: 'easy'}
// result from req.params: { duration: { gte: '5' }, difficulty: 'easy' }
// words to look for and add in query with '$': gte, gt, lte, lt

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  // const tour = tours.find((tour) => tour.id === +req.params.id);

  try {
    const tour = await Tour.findById(req.params.id);
    // The shorthand for: Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      // will set content-type: application/json automatically
      status: 'success',
      requestedAt: req.requestTime, // req.requestTime was added in MW f()
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent',
    });
  }
};
