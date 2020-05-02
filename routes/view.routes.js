const express = require('express');
const viewController = require('../controllers/view.controller');

const router = express.Router();

router.get('/', viewController.getOverview);

router.get('/login', viewController.getLoginForm);

router.get('/tour/:slug', viewController.getTour);

module.exports = router;
