const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error.controller');
const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/review.routes');

const app = express();

// GLOBAL MW f()
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 100 requests from same IP in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP. Please try again in 1 hour',
});

// to affect only routes that start with '/api'
app.use('/api', limiter);

// middleware to get 'body' data from request object => makes req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSqL injection and XSS
app.use(mongoSanitize());
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration', // allows to duplicate these properties: e.g.: ?duration=5&duration=9
      'ratingsQuantity',
      'ratingsAverage',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // each app f() has access to req. and res.
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // anything that is passed in next() f() is treated as an Error
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
