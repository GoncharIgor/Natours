const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

//TODO to add nested routes
// tours/:id/bookings - all bookings for specific tour
// suers/:id/bookings - all bookings for specific user
// prevent duplicated bookings and reviews

module.exports = router;
