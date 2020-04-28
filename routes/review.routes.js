const express = require('express');
const reviewController = require('../controllers/review.controller');
const authController = require('../controllers/auth.controller');

// mergeParams - to get access to params of '/:tourId/reviews' redirector
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourAndUserIDs,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

// router.route('/:id').get(reviewController.getReview);

module.exports = router;
