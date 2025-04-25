const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const logger = require('./logger');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    logger.info('Firebase initialized successfully');
} catch (error) {
    logger.error('Error initializing Firebase:', error);
    throw error;
}

module.exports = {
    app,
    db
};