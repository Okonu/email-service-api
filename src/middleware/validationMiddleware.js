const { validateEmail } = require('../utils/validation');
const logger = require('../utils/logger');

const validateEmailRequest = (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        logger.warn('Validation failed: Missing required fields');
        return res.status(400).json({
            success: false,
            error: 'All fields are required'
        });
    }

    if (!validateEmail(email)) {
        logger.warn(`Invalid email format: ${email}`);
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    req.body.name = name.trim();
    req.body.email = email.trim();
    req.body.message = message.trim();

    if (!req.body.name || !req.body.message) {
        logger.warn('Validation failed: Empty name or message');
        return res.status(400).json({
            success: false,
            error: 'Name and message cannot be empty'
        });
    }

    next();
};

module.exports = { validateEmailRequest };