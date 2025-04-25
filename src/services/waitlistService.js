const nodemailer = require('nodemailer');
const { collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const { db } = require('../utils/firebase');
const logger = require('../utils/logger');

class WaitlistService {
    constructor() {
        console.log('Waitlist Service Configuration:', {
            emailUser: process.env.EMAIL_USER,
            hasPass: process.env.EMAIL_PASS ? 'Set' : 'Missing',
            appName: process.env.APP_NAME || 'NAME'
        });
        this.transporter = this._createTransporter();
    }

    _createTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 10000,
            socketTimeout: 10000
        });
    }

    _formatNairobiTime() {
        return new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Nairobi',
            dateStyle: 'full',
            timeStyle: 'long'
        });
    }

    _sanitizeHTML(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async addToWaitlist(waitlistData) {
        const { email, ipAddress, utmSource, utmMedium, utmCampaign } = waitlistData;

        if (!email) {
            const validationError = new Error('Email is required');
            validationError.status = 400;
            throw validationError;
        }

        try {
            const waitlistRef = collection(db, 'waitlist');
            const q = query(waitlistRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                logger.info(`Email already exists in waitlist: ${email}`);
                return {
                    success: true,
                    message: 'You are already on our waitlist!',
                    alreadyExists: true,
                    timestamp: this._formatNairobiTime()
                };
            }

            const docData = {
                email,
                status: 'active',
                joinedAt: new Date().toISOString()
            };

            if (ipAddress) docData.ipAddress = ipAddress;

            if (utmSource) docData.utmSource = String(utmSource);
            if (utmMedium) docData.utmMedium = String(utmMedium);
            if (utmCampaign) docData.utmCampaign = String(utmCampaign);

            const docRef = await addDoc(waitlistRef, docData);

            logger.info(`New user added to waitlist: ${email}`);

            await this.sendWaitlistConfirmationEmail(email);

            return {
                success: true,
                message: 'Successfully added to waitlist',
                documentId: docRef.id,
                timestamp: this._formatNairobiTime()
            };

        } catch (error) {
            logger.error('Error adding to waitlist:', error);
            throw error;
        }
    }

    async sendWaitlistConfirmationEmail(email) {
        const appName = process.env.APP_NAME || 'NAME';

        const mailOptions = {
            from: `${appName} Team <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Welcome to the ${appName} Waitlist!`,
            html: this._createWaitlistConfirmationHTML(email),
            text: this._createWaitlistConfirmationText(email)
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Waitlist confirmation email sent to: ${email}`);
            return {
                success: true,
                messageId: info.messageId,
                timestamp: this._formatNairobiTime()
            };
        } catch (error) {
            logger.error('Error sending waitlist confirmation email:', error);
            return {
                success: false,
                error: error.message,
                timestamp: this._formatNairobiTime()
            };
        }
    }

    _createWaitlistConfirmationHTML(email) {
        const appName = process.env.APP_NAME || 'NAME';
        const twitter = process.env.SOCIAL_TWITTER || 'https://twitter.com';
        const instagram = process.env.SOCIAL_INSTAGRAM || 'https://instagram.com';
        const linkedin = process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company';

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${appName} Waitlist</title>
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
                    background: linear-gradient(135deg, #121622 0%, #1E2537 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    background: linear-gradient(95deg, #ffffff 20%, #e0e0e0 80%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                }
                .email-content {
                    padding: 30px;
                }
                .email-section {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .social-links {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 30px 0;
                }
                .social-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                }
                .social-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .twitter {
                    background-color: #1DA1F2;
                }
                .instagram {
                    background-color: #E1306C;
                }
                .linkedin {
                    background-color: #0077B5;
                }
                .social-name {
                    color: #555;
                    font-size: 14px;
                }
                .email-footer {
                    text-align: center;
                    color: #6b7280;
                    font-size: 12px;
                    padding: 20px;
                    background-color: #f9fafb;
                }
                .cta-button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Thanks for joining our waitlist!</h1>
                </div>
                <div class="email-content">
                    <p>Hi there,</p>
                    <p>Thank you for joining the ${appName} waitlist! We're excited to have you on board and can't wait to share our MVP with you.</p>
                    <p>We'll notify you as soon as we're ready to launch.</p>
                    
                    <p>In the meantime, follow us on social media for updates and behind-the-scenes content:</p>
                    <div class="social-links">
                        <a href="${twitter}" class="social-link">
                            <div class="social-icon twitter">X</div>
                            <span class="social-name">Twitter</span>
                        </a>
                        <a href="${instagram}" class="social-link">
                            <div class="social-icon instagram">IG</div>
                            <span class="social-name">Instagram</span>
                        </a>
                        <a href="${linkedin}" class="social-link">
                            <div class="social-icon linkedin">in</div>
                            <span class="social-name">LinkedIn</span>
                        </a>
                    </div>
                    
                    <p>If you have any questions or suggestions, feel free to reply to this email.</p>
                    <p>Best regards,<br/>The ${appName} Team</p>
                </div>
                <div class="email-footer">
                    <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                    <p>You received this email because you signed up for our waitlist.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    _createWaitlistConfirmationText(email) {
        const appName = process.env.APP_NAME || 'NAME';
        const twitter = process.env.SOCIAL_TWITTER || 'https://twitter.com';
        const instagram = process.env.SOCIAL_INSTAGRAM || 'https://instagram.com';
        const linkedin = process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company';

        return `
        Welcome to the ${appName} Waitlist!
        
        Hi there,
        
        Thank you for joining the ${appName} waitlist! We're excited to have you on board and can't wait to share our MVP with you.
        
        We'll notify you as soon as we're ready to launch.
        
        In the meantime, follow us on social media for updates:
        - Twitter: ${twitter}
        - Instagram: ${instagram}
        - LinkedIn: ${linkedin}
        
        If you have any questions or suggestions, feel free to reply to this email.
        
        Best regards,
        The ${appName} Team
        
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
        `;
    }
}

module.exports = new WaitlistService();