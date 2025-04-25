const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const emailRoutes = require('./routes/emailRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

try {
    const { db } = require('./utils/firebase');
    if (db) {
        logger.info('Firebase connection initialized successfully');
    } else {
        logger.warn('Firebase connection not available - some features may be limited');
    }
} catch (error) {
    logger.error('Error initializing Firebase:', error);
}

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    logger.debug('Headers:', req.headers);
    next();
});

const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
];

if (process.env.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
    allowedOrigins.push(...additionalUrls);
}

const corsOptions = {
    origin: allowedOrigins.filter(Boolean),
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 200,
    credentials: false
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

const connectSrc = ["'self'", "http://localhost:3000"];
if (process.env.FRONTEND_URL) {
    connectSrc.push(process.env.FRONTEND_URL);
}
if (process.env.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
    connectSrc.push(...additionalUrls);
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: connectSrc,
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
app.use('/api', waitlistRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors: corsOptions.origin,
        database: 'Firebase Firestore'
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