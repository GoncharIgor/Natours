const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour.model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    // info about session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // info about product
    line_items: [
      {
        // these fields are defined by stripe
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
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
