const Tour = require('../models/tour.model');

// Greater then Query object in mongoDB: { duration: {$gte: 5}, difficulty: 'easy'}
// result from req.params: { duration: { gte: '5' }, difficulty: 'easy' }
// words to look for and add in query with '$': gte, gt, lte, lt

exports.getAllTours = async (req, res) => {
  try {
    // 1 way
    /*   const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    });*/

    // 2 way
    /*const query = Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');*/

    // BUILD QUERY
    // 1) Filtering
    const queryObj = { ...req.query };
    const fieldsToExclude = ['page', 'sort', 'limit', 'fields'];
    fieldsToExclude.forEach((el) => delete queryObj[el]);

    // 2) Advanced Filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedWord) => `$${matchedWord}`
    );

    let query = Tour.find(JSON.parse(queryString)); // find method returns a query Obj. That why we can chain f() above

    // 3) Sorting
    // if query Obj has 'sort' property
    // string in browser: 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage (sort price Desc and by second parameter, as addition)
    // but sort query in mongoose is with space: sort(price ratingsAverage). Thus - we split with space
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // EXECUTE QUERY
    const tours = await query;

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
