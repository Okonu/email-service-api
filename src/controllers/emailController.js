const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

class EmailController {
    static async sendContactEmail(req, res, next) {
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