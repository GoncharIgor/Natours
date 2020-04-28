const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const APIFeatures = require('../utils/api-features');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(
        new AppError(`No document was found with ID: ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(
        new AppError(`No document was found with ID: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    // The shorthand for: Tour.findOne({ _id: req.params.id });
    let query = Model.findById(req.params.id);
    // const tour = tours.find((tour) => tour.id === +req.params.id);
    // we can also add .populate() f() here
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const document = await query;

    if (!document) {
      return next(
        new AppError(`No document was found with ID: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      // will set content-type: application/json automatically
      status: 'success',
      requestedAt: req.requestTime, // req.requestTime was added in MW f()
      data: {
        data: document,
      },
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // let query = Tour.find(JSON.parse(queryString)); // find method returns a query Obj. That why we can chain f()

    // hack to allow nested GET reviews on tour
    let filter = {};

    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      // will set content-type: application/json automatically
      status: 'success',
      requestedAt: req.requestTime, // req.requestTime was added in MW f()
      results: documents.length,
      data: {
        data: documents,
      },
    });
  });
};
