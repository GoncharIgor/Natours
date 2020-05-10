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
const compression = require('compression');

const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error.controller');
const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/review.routes');
const viewRouter = require('./routes/view.routes');
const bookingRouter = require('./routes/booking.routes');

const bookingController = require('./controllers/booking.controller');

// const uiUrl = 'http://127.0.0.1:3000';
// const uiUrl = `${process.env.UI_URL}:${process.env.PORT}`;
const corsOptions = {
  // origin: uiUrl,
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'Origin',
    'X-Access-Token',
    'X-Requested-With',
  ],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200,
  'Access-Control-Allow-Origin': '*',
  // To enable HTTP cookies over CORS
  // credentials: true,
  // 'Access-Control-Allow-Credentials': true,
};

const app = express();

app.enable('trust proxy'); // for heroku, because it redirects original requests. Will enable 'x-forwarded-proto'

app.set('view engine', 'pug');
app.set('views', `${path.join(__dirname, 'views')}`);

// GLOBAL MW f()
// 'Access-Control-Allow-Origin': *, // allow all domains
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // for complex requests from client

app.use(express.static(path.join(__dirname, 'public')));
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

// for stripe, we need the body to be in raw format, not JSON. That's why we put it here before, we make use.json()
app.post('/webhook-checkout', express.raw(), bookingController.webhookCheckout);

// middleware to get 'body' data from request object => makes req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(
  // to parse data from url: uri?param=aa
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

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

app.use(compression());

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
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // anything that is passed in next() f() is treated as an Error
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
