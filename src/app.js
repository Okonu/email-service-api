const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/emailRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    console.log('Headers:', req.headers);
    next();
});

const corsOptions = {
    origin: ['https://okonu.vercel.app', 'http://localhost:3000'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200,
    credentials: false
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://okonu.vercel.app", "http://localhost:3000"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"]
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later',
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'];
    }
});
app.use(limiter);

app.get('/api/test-cors', (req, res) => {
    res.json({
        message: 'CORS is working',
        origin: req.headers.origin,
        ip: req.ip,
        forwardedFor: req.headers['x-forwarded-for']
    });
});

app.use('/api', emailRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors: corsOptions.origin
    });
});

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;