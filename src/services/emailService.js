const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        console.log('Email Service Configuration:', {
            emailUser: process.env.EMAIL_USER,
            emailRecipient: process.env.EMAIL_RECIPIENT,
            emailPass: process.env.EMAIL_PASS,
            hasPass: process.env.EMAIL_PASS ? 'Set' : 'Missing'
        });
        this.transporter = this._createTransporter();
    }

    _createTransporter() {
        const transportConfig = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000,
            socketTimeout: 10000
        };

        console.log('Creating transporter with config:', {
            service: transportConfig.service,
            user: transportConfig.auth.user ? transportConfig.auth.user.substring(0, 3) + '...' : 'Missing',
            passLength: transportConfig.auth.pass ? 'Set' : 'Missing',
            timeouts: {
                connection: transportConfig.connectionTimeout,
                socket: transportConfig.socketTimeout
            }
        });

        return nodemailer.createTransport(transportConfig);
    }

    _formatNairobiTime() {
        return new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Nairobi',
            dateStyle: 'full',
            timeStyle: 'long'
        });
    }

    _sanitizeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    _createEmailHTML(name, email, message) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email from Portfolio</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f6f9;
                    margin: 0;
                    padding: 20px;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }
                .email-header {
                    background-color: #6b7280;
                    color: white;
                    text-align: center;
                    padding: 10px;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1rem;
                }
                .email-content {
                    padding: 30px;
                }
                .email-section {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .email-footer {
                    text-align: center;
                    color: #6b7280;
                    font-size: 12px;
                    padding: 20px;
                    background-color: #f9fafb;
                }
                strong {
                    color: #1f2937;
                }
                p {
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>This is a message from my portfolio contact form</h1>
                </div>
                <div class="email-content">
                    <div class="email-section">
                        <strong>Name:</strong>
                        <p>${this._sanitizeHTML(name)}</p>
                    </div>
                    <div class="email-section">
                        <strong>Email:</strong>
                        <p>${this._sanitizeHTML(email)}</p>
                    </div>
                    <div class="email-section">
                        <strong>Message:</strong>
                        <p>${this._sanitizeHTML(message)}</p>
                    </div>
                </div>
                <div class="email-footer">
                    <p>Received at: ${this._formatNairobiTime()}</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendContactEmail(emailData) {
        const { name, email, message } = emailData;

        console.log('Attempting to send email with data:', {
            fromName: name,
            fromEmail: email,
            messageLength: message?.length,
            recipient: process.env.EMAIL_RECIPIENT ? process.env.EMAIL_RECIPIENT.substring(0, 3) + '...' : 'Missing'
        });

        if (!name || !email || !message) {
            const validationError = new Error('All fields are required');
            validationError.status = 400;
            throw validationError;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: email,
            to: process.env.EMAIL_RECIPIENT,
            subject: `Portfolio contact form message from ${name}`,
            html: this._createEmailHTML(name, email, message),
            text: this._createEmailText(name, email, message)
        };

        try {
            console.log('Sending email with options:', {
                from: mailOptions.from ? mailOptions.from.substring(0, 3) + '...' : 'Missing',
                to: mailOptions.to ? mailOptions.to.substring(0, 3) + '...' : 'Missing',
                replyTo: mailOptions.replyTo,
                subject: mailOptions.subject,
                hasHtml: !!mailOptions.html,
                hasText: !!mailOptions.text
            });

            const info = await this.transporter.sendMail(mailOptions);

            console.log('Email sent successfully:', {
                messageId: info.messageId,
                response: info.response,
                timestamp: this._formatNairobiTime()
            });

            return {
                success: true,
                messageId: info.messageId,
                timestamp: this._formatNairobiTime()
            };
        } catch (error) {
            console.error('Detailed email sending error:', {
                code: error.code,
                message: error.message,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode,
                stack: error.stack
            });

            logger.error('Email sending error:', error);

            const sendError = new Error(
                error.code === 'EAUTH'
                    ? 'Authentication failed. Please check email credentials.'
                    : 'Failed to send email'
            );
            sendError.status = 500;
            throw sendError;
        }
    }

    _createEmailText(name, email, message) {
        return `
        Message portfolio contact form message
        
        Sender Details:
        - Name: ${name}
        - Email: ${email}
        
        Message:
        ${message}
        
        Received at: ${this._formatNairobiTime()}
        `;
    }
}

module.exports = new EmailService();