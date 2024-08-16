const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utilitis/appError');
const globalErrorHandler = require('./controller/errorController');

// 2) ROUTE HANDLERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controller/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static file (from folder and not route)
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Set security http headers

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com',
  'https://*.stripe.com',
  'https://*.mapbox.com',
  'https://*.openstreetmap.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.mapbox.com',
  'https://checkout.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      baseUri: ["'self'"],
      connectSrc: ["'self'", 'blob:', ...connectSrcUrls],
      scriptSrc: [
        "'self'",
        'https:',
        'http:',
        'blob:',
        'https://*.stripe.com',
        ...scriptSrcUrls,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://*.stripe.com'],
      childSrc: ["'self'", 'blob:'],
    },
  })
);
// console.log(process.env);

// 1) MIDDLEWARES
// Logs requests in the console
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// Implement rate limiting
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP.Please try again later.',
});
app.use('/api', limiter);

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  express.json({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Parse the request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attack
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

app.use(compression());

// // Custom middleware example
// app.use((req, res, next) => {
//   console.log('This is a middleware');
//   next();
// });

// 3) ROUTES MOUNTS
// SSR view route

// API routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `The requested URL ${req.originalUrl} could not be found on the server`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
