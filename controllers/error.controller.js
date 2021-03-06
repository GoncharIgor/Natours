const AppError = require('../utils/app-error');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  let errCounter = 1;
  const errors = Object.values(err.errors).map(
    // eslint-disable-next-line no-plusplus
    (el) => `${errCounter++}) ${el.message}`
  );

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again', 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  console.error(err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operations error - incorrect data sent by client
    // e.g - incorrect format of ID; model validation (not enum value); duplicated Name
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming error - a bug
    }

    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later',
  });
};

// by specifying 4 parameters in MW f(), express automatically knows that it is an Error handling f()
// then it will skip all other MWs and will go to error handling MW
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let copyOfErr = { ...err };
    copyOfErr.message = err.message;

    if (copyOfErr.name === 'CastError') {
      copyOfErr = handleCastErrorDB(err);
    }

    if (copyOfErr.code === 11000) {
      copyOfErr = handleDuplicateFieldsDB(err);
    }

    if (copyOfErr.name === 'ValidationError') {
      copyOfErr = handleValidationErrorDB(err);
    }

    if (copyOfErr.name === 'JsonWebTokenError') {
      copyOfErr = handleJWTError();
    }

    if (copyOfErr.name === 'TokenExpiredError') {
      copyOfErr = handleJWTExpiredError();
    }

    sendErrorProd(copyOfErr, req, res);
  }
};
