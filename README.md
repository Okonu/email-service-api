# Contact Form Email Service & Waitlist API

## Overview
A robust, secure Express.js backend service for handling contact form email submissions and waitlist signups using Firebase Firestore.

## Features
- Secure email sending via Nodemailer
- Firebase Firestore integration for waitlist users
- Serverless-ready architecture
- Input validation
- Rate limiting
- Comprehensive error handling
- Logging
- CORS support
- Environment-based configuration

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Gmail Account with App Password
- Firebase account and project

## API Endpoints

### Contact Form
```bash
POST /api/send-email
```

### Waitlist
```bash
POST /api/waitlist
GET /api/waitlist/health
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/Okonu/email-service-api.git
cd email-service-api
```

2. Install dependencies
```bash
npm install
```

3. Configure Environment
- Copy `.env.example` to `.env`
- Fill in your configuration details

## Configuration

### Gmail App Password
1. Enable 2-Step Verification in your Google Account
2. Go to App Passwords
3. Generate an App Password for your application

### Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database in your project
3. Generate a web app configuration (Project settings > Your apps > Web app)
4. Add the Firebase configuration to your environment variables

### Environment Variables

#### Server Configuration
- `PORT`: Server port
- `NODE_ENV`: Application environment (development, production)

#### Email Configuration
- `EMAIL_USER`: Gmail account
- `EMAIL_PASS`: Gmail App Password
- `EMAIL_RECIPIENT`: Email where contact form messages will be sent

#### Firebase Configuration
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID

#### CORS Configuration
- `FRONTEND_URL`: Primary frontend domain
- `ADDITIONAL_FRONTEND_URLS`: Comma-separated list of additional allowed domains

#### Application Details
- `APP_NAME`: Application name for email templates
- `SOCIAL_TWITTER`: Twitter URL for waitlist emails
- `SOCIAL_INSTAGRAM`: Instagram URL for waitlist emails
- `SOCIAL_LINKEDIN`: LinkedIn URL for waitlist emails

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Troubleshooting
- Verify Gmail credentials
- Check Firebase connection and permissions
- Ensure correct environment variables are set
- Review application logs for detailed error messages

## License
MIT License