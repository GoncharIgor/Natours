const express = require('express');
const viewController = require('../controllers/view.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getUserAccount);

module.exports = router;
