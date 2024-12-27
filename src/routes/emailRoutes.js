const express = require('express');
const emailController = require('../controllers/emailController');
const { validateEmailRequest } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/send-email', validateEmailRequest, emailController.sendContactEmail);

module.exports = router;