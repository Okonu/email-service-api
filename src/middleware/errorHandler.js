const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);

    const statusCode = err.status || 500;
    const errorResponse = {
        success: false,
        error: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;