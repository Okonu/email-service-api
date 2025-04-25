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
        const tagline = process.env.APP_TAGLINE || 'TAG LINE';
        const twitter = process.env.SOCIAL_TWITTER || 'https://twitter.com';
        const instagram = process.env.SOCIAL_INSTAGRAM || 'https://instagram.com';
        const linkedin = process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company';
        const websiteUrl = process.env.WEBSITE_URL || 'https://name.ke';

        const navyBlue = '#1E2537';
        const orangeColor = '#FF5722';
        const logoUrl = process.env.LOGO_URL || `https://placehold.co/200x60/${navyBlue.replace('#', '')}/${orangeColor.replace('#', '')}?text=${appName}`;

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${appName} Waitlist</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #374151;
                    background-color: #f5f7fa;
                    margin: 0;
                    padding: 0;
                }
                
                .wrapper {
                    width: 100%;
                    table-layout: fixed;
                    background-color: #f5f7fa;
                    padding: 40px 10px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                }
                
                .email-header {
                    padding: 30px 40px;
                    text-align: center;
                    background-color: #ffffff;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .logo {
                    max-width: 180px;
                    height: auto;
                }
                
                .email-body {
                    padding: 40px;
                }
                
                .email-footer {
                    background-color: #f9fafb;
                    color: #6b7280;
                    font-size: 12px;
                    text-align: center;
                    padding: 24px 40px;
                    border-top: 1px solid #f0f0f0;
                }
                
                h1 {
                    color: ${navyBlue};
                    font-size: 24px;
                    font-weight: 700;
                    margin-top: 0;
                    margin-bottom: 20px;
                }
                
                p {
                    margin: 0 0 20px;
                    color: #4b5563;
                    font-size: 16px;
                }
                
                .highlight {
                    color: ${orangeColor};
                    font-weight: 600;
                }
                
                .button {
                    display: inline-block;
                    background-color: ${orangeColor};
                    color: #ffffff !important;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 15px;
                    padding: 12px 30px;
                    border-radius: 8px;
                    margin: 25px 0;
                    text-align: center;
                    transition: all 0.2s ease;
                }
                
                .button:hover {
                    background-color: #e04b18;
                }
                
                .social-bar {
                    background-color: #ffffff;
                    padding: 20px 0;
                    text-align: center;
                    border-top: 1px solid #f0f0f0;
                }
                
                .social-icons {
                    font-size: 0;
                }
                
                .social-icon {
                    display: inline-block;
                    margin: 0 10px;
                    width: 36px;
                    height: 36px;
                    background-color: #f5f7fa;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 36px;
                    transition: all 0.2s;
                }
                
                .social-icon:hover {
                    background-color: ${orangeColor};
                }
                
                .social-icon img {
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                }
                
                .divider {
                    height: 1px;
                    width: 100%;
                    background-color: #f0f0f0;
                    margin: 30px 0;
                }
                
                .logo-container {
                    position: relative;
                    display: inline-block;
                }
                
                .gauge-element {
                    position: absolute;
                    top: -10px;
                    right: -20px;
                    width: 50px;
                    height: 50px;
                    border: 3px solid ${orangeColor};
                    border-radius: 50%;
                    border-left-color: ${navyBlue};
                    transform: rotate(45deg);
                }
                
                .tagline {
                    display: block;
                    font-size: 14px;
                    color: ${navyBlue};
                    font-weight: 600;
                    margin-top: 5px;
                    letter-spacing: 1px;
                }
                
                @media screen and (max-width: 600px) {
                    .email-header, .email-body, .email-footer {
                        padding: 30px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="email-container">
                    <div class="email-header">
                        <div class="logo-container">
                            <a href="${websiteUrl}" target="_blank">
                                <img src="${logoUrl}" alt="${appName} Logo" class="logo">
                            </a>
                            <span class="tagline">${tagline}</span>
                        </div>
                    </div>
                    
                    <div class="email-body">
                        <h1>Welcome to the ${appName} Waitlist!</h1>
                        
                        <p>Hi there,</p>
                        
                        <p>Thanks for joining the <span class="highlight">${appName} waitlist</span>! We're thrilled to have you on board and can't wait to share our innovative solution with you.</p>
                        
                        <p>You're now among the first to know when we launch. We're working hard behind the scenes to create something exceptional, and we're excited to have you join us on this journey.</p>
                        
                        <p>What happens next? We'll notify you as soon as we're ready to launch, and as a waitlist member, you'll get:</p>
                        
                        <ul style="color: #4b5563; padding-left: 25px; margin-bottom: 25px;">
                            <li style="margin-bottom: 10px;">Early access to our platform</li>
                            <li style="margin-bottom: 10px;">Exclusive features for early adopters</li>
                            <li>Special launch offers</li>
                        </ul>
                        
                        <a href="${websiteUrl}" class="button">Learn More About ${appName}</a>
                        
                        <div class="divider"></div>
                        
                        <p style="margin-bottom: 10px;">In the meantime, follow us on social media for updates, behind-the-scenes content, and more:</p>
                    </div>
                    
                    <div class="social-bar">
                        <div class="social-icons">
                            <a href="${twitter}" class="social-icon" style="text-decoration: none;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${navyBlue}">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a href="${instagram}" class="social-icon" style="text-decoration: none;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${navyBlue}">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="${linkedin}" class="social-icon" style="text-decoration: none;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${navyBlue}">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    <div class="email-footer">
                        <p style="margin-bottom: 10px; color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                        <p style="margin-bottom: 0; color: #6b7280; font-size: 12px;">You received this email because you signed up for the ${appName} waitlist.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    _createWaitlistConfirmationText(email) {
        const appName = process.env.APP_NAME || 'NAME';
        const tagline = process.env.APP_TAGLINE || 'TAG LINE';
        const twitter = process.env.SOCIAL_TWITTER || 'https://twitter.com';
        const instagram = process.env.SOCIAL_INSTAGRAM || 'https://instagram.com';
        const linkedin = process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company';
        const websiteUrl = process.env.WEBSITE_URL || 'https://name.ke';

        return `
        ${appName} | ${tagline}
        
        WELCOME TO THE ${appName} WAITLIST!
        
        Hi there,
        
        Thanks for joining the ${appName} waitlist! We're thrilled to have you on board and can't wait to share our innovative solution with you.
        
        You're now among the first to know when we launch. We're working hard behind the scenes to create something exceptional, and we're excited to have you join us on this journey.
        
        What happens next? We'll notify you as soon as we're ready to launch, and as a waitlist member, you'll get:
        
        - Early access to our platform
        - Exclusive features for early adopters
        - Special launch offers
        
        Learn more about ${appName}: ${websiteUrl}
        
        FOLLOW US FOR UPDATES:
        - Twitter: ${twitter}
        - Instagram: ${instagram}
        - LinkedIn: ${linkedin}
        
        If you have any questions or suggestions, feel free to reply to this email.
        
        Best regards,
        The ${appName} Team
        
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
        You received this email because you signed up for the ${appName} waitlist.
        `;
    }
}

module.exports = new WaitlistService();