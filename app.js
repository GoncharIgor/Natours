const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error.controller');
const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // middleware to get 'body' data from request object
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // each app f() has access to req. and res.
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // anything that is passed in next() f() is treated as an Error
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
