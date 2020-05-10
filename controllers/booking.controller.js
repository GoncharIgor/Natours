const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catch-async');
const factory = require('./handler-factory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    // info about session
    payment_method_types: ['card'],
    // FOR LOCAL CHECKOUT TESTING, WITHOUT STRIPE WEBHOOKS
    /*success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,*/
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // info about product
    line_items: [
      {
        // these fields are defined by stripe
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `https://natours-igorgo.herokuapp.com/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1, // 1 Tour
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// FOR LOCAL CHECKOUT TESTING, WITHOUT STRIPE WEBHOOKS
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // unsecure - because we may create tour with API
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  // next();
  // but in order not to show the whole URL with query options, we hide it from original url
  // creates new request to ('/') but now without checkout data
  res.redirect(req.originalUrl.split('?')[0]);
});

const createBookingCheckoutForStripe = async (session) => {
  // client_ref_id is, customer_email stored in getCheckoutSession()
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id; // get userId
  const price = session.line_items[0].amount / 100;

  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let stripeEvent;
  try {
    // body needs to be in a raw form - as a stream
    stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    return res.status(400).send('Webhook error:', e.message);
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    createBookingCheckoutForStripe(stripeEvent.data.object);
  }

  res.status(200).json({
    received: true,
  });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
