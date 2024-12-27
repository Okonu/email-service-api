const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/emailRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://okonu.vercel.app',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

app.use('/api', emailRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.use(errorHandler);

module.exports = app;