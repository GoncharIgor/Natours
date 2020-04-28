const express = require('express');
const tourController = require('../controllers/tour.controller');
const authController = require('../controllers/auth.controller');
const reviewRouter = require('../routes/review.routes');

const router = express.Router();

// router.param('id', tourController.checkID); // router.param - this MW f() is executed only when url has 'id' parameter

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// the same as below

router.use('/:tourId/reviews', reviewRouter); // user review router for current uri

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
// .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
