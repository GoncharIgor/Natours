const express = require('express');
const reviewController = require('../controllers/review.controller');
const authController = require('../controllers/auth.controller');

// mergeParams - to get access to params of '/:tourId/reviews' redirector
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

// router.route('/:id').get(reviewController.getReview);

module.exports = router;
