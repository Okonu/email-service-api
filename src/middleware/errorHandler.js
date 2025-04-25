const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        query: req.query,
        headers: {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            origin: req.headers.origin
        }
    });

    const statusCode = err.status || err.statusCode || 500;

    const errorResponse = {
        success: false,
        error: err.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    if (!res.headersSent) {
        return res.status(statusCode).json(errorResponse);
    } else {
        logger.warn('Headers already sent, unable to send error response');
    }
};

module.exports = errorHandler;