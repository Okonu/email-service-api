const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const logger = require('./logger');

const initializeFirebase = () => {
    try {
        const requiredConfig = [
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN',
            'FIREBASE_PROJECT_ID'
        ];

        const missingConfig = requiredConfig.filter(key => !process.env[key]);

        if (missingConfig.length > 0) {
            throw new Error(`Missing required Firebase configuration: ${missingConfig.join(', ')}`);
        }

        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_APP_ID || ''
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        logger.info('Firebase initialized successfully');

        return { app, db };
    } catch (error) {
        logger.error('Failed to initialize Firebase:', error);

        return { app: null, db: null };
    }
};

const { app, db } = initializeFirebase();

module.exports = {
    app,
    db
};