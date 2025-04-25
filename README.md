# Contact Form Email Service & Waitlist API

## Overview
A robust, secure Express.js backend service for handling contact form email submissions and waitlist signups.

## Features
- Secure email sending via Nodemailer
- MySQL database integration for waitlist users
- SSH tunnel for secure database connections
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
- MySQL database
- SSH access to your database server

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

4. Set up the database
```bash
npm run init-db
```

## Configuration

### Gmail App Password
1. Enable 2-Step Verification in your Google Account
2. Go to App Passwords
3. Generate an App Password for your application

### Database Setup
1. Create a MySQL database on your server
2. Update the database connection details in `.env`
3. For secure remote connections, enable the SSH tunnel:
   ```
   USE_SSH_TUNNEL=true
   SSH_HOST=your-vps-ip
   SSH_PORT=22
   SSH_USERNAME=root
   SSH_PASSWORD=your-password
   ```
4. Run the database initialization script:
   ```bash
   npm run init-db
   ```

### Environment Variables

#### Server Configuration
- `PORT`: Server port
- `NODE_ENV`: Application environment (development, production)

#### Email Configuration
- `EMAIL_USER`: Gmail account
- `EMAIL_PASS`: Gmail App Password
- `EMAIL_RECIPIENT`: Email where contact form messages will be sent

#### Database Configuration
- `DB_CONNECTION`: Database type (mysql)
- `DB_HOST`: Database host (IP address or hostname)
- `DB_PORT`: Database port (typically 3306)
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

#### SSH Tunnel Configuration
- `USE_SSH_TUNNEL`: Set to 'true' to enable SSH tunnel for database
- `SSH_HOST`: SSH server host (usually same as DB_HOST)
- `SSH_PORT`: SSH port (usually 22)
- `SSH_USERNAME`: SSH username
- `SSH_PASSWORD`: SSH password
- `SSH_PRIVATE_KEY_PATH`: Path to SSH private key file (alternative to password)

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
- Check database connection
- Check SSH access to your server
- Verify firewall settings allow SSH connections
- Ensure correct environment variables are set
- Review application logs for detailed error messages

## License
MIT License