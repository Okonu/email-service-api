require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

module.exports = app;

if (ENV !== 'production') {
    const server = http.createServer(app);

    server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${ENV}`);
    });

    process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully');
        server.close(() => {
            logger.info('Process terminated');
            process.exit(0);
        });
    });
}