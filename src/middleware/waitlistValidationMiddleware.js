const { validateEmail } = require('../utils/validation');
const logger = require('../utils/logger');

const validateWaitlistRequest = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        logger.warn('Waitlist validation failed: Missing email');
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }

    if (!validateEmail(email)) {
        logger.warn(`Invalid email format in waitlist request: ${email}`);
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    req.body.email = email.trim().toLowerCase();

    next();
};

module.exports = { validateWaitlistRequest };