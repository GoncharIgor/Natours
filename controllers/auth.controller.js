const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catch-async');
const AppArror = require('../utils/app-error');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // not pass req.body - so nobody van pass 'admin' role
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and pass exist
  if (!email || !password) {
    return next(new AppArror('Please provide email and password', 400));
  }

  // 2) Check if user exists and pass is correct
  const user = await User.findOne({ email }) // the same as: { email: email }
    .select('+password');
  // correctPassword() - defined in the model

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppArror('Incorrect email or password', 401));
  }

  // 3) Send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
