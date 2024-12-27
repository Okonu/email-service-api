# Contact Form Email Service Backend API

## Overview
A robust, secure Express.js backend service for handling contact form email submissions.

## Features
- Secure email sending via Nodemailer
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

### Environment Variables
- `PORT`: Server port
- `NODE_ENV`: Application environment
- `EMAIL_USER`: Gmail account
- `EMAIL_PASS`: Gmail App Password
- `EMAIL_RECIPIENT`: Email where contact form messages will be sent
- `FRONTEND_URL`: Your frontend application URL

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
- Check firewall settings
- Ensure correct environment variables
- Review application logs

## License
MIT License