const express = require('express');
const waitlistController = require('../controllers/waitlistController');
const { validateWaitlistRequest } = require('../middleware/waitlistValidationMiddleware');

const router = express.Router();

router.post('/waitlist', validateWaitlistRequest, waitlistController.addToWaitlist);

router.get('/waitlist/health', waitlistController.checkWaitlistHealth);

module.exports = router;