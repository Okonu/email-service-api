const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

console.log('=== EMAIL CONTROLLER LOADED ===');
console.log('EmailService instance:', EmailService);

class EmailController {
    static async sendContactEmail(req, res, next) {
        console.log('=== SEND CONTACT EMAIL STARTED ===');
        console.log('Environment variables:', {
            EMAIL_USER_EXISTS: !!process.env.EMAIL_USER,
            EMAIL_PASS_EXISTS: !!process.env.EMAIL_PASS,
            EMAIL_RECIPIENT_EXISTS: !!process.env.EMAIL_RECIPIENT
        });

        try {
            const { name, email, message } = req.body;

            const result = await EmailService.sendContactEmail({
                name,
                email,
                message
            });

            res.status(200).json({
                success: true,
                message: 'Email sent successfully',
                timestamp: result.timestamp
            });
        } catch (error) {
            logger.error(`Email sending error: ${error.message}`);
            next(error);
        }
    }
}

module.exports = EmailController;