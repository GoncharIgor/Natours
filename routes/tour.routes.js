const express = require('express');
const tourController = require('../controllers/tour.controller');

const router = express.Router();

// router.param('id', tourController.checkID); // router.param - this MW f() is executed only when url has 'id' parameter

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// the same as below

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
