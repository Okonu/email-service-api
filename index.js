require('dotenv').config();
const http = require('http');
const app = require('./src/app');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

module.exports = app;

if (ENV !== 'production') {
    const server = http.createServer(app);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${ENV}`);
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
}