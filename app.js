const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
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
const viewRouter = require('./routes/view.routes');

const uiUrl = 'http://localhost:3000';

const corsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: uiUrl,
  optionsSuccessStatus: 200,
};

const app = express();

app.set('view engine', 'pug');
app.set('views', `${path.join(__dirname, 'views')}`);

// GLOBAL MW f()
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use(cors(corsOptions));

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
// app.use(cookieParser());

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

app.use((req, res, next) => {
  // each app f() has access to req. and res.
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // anything that is passed in next() f() is treated as an Error
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
