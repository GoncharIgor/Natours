const Tour = require('../models/tour.model');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with this name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in',
  });
};

exports.getUserAccount = (req, res) => {
  res.status(200).render('user-account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({
    user: req.user.id,
  });

  const tourIDs = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // select all tours with IDs, that are in tourIDs array

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('user-account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  // to add 'alert' var in pug template
  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful. Please check your email for confirmation. If your booking does not show here immediately, please come back later';
  }

  next();
};
