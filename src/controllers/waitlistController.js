const WaitlistService = require('../services/waitlistService');
const logger = require('../utils/logger');

class WaitlistController {
    static async addToWaitlist(req, res, next) {
        try {
            const { email } = req.body;

            const ipAddress = req.headers['x-forwarded-for'] || req.ip;

            const utmSource = req.body.utm_source || req.query.utm_source;
            const utmMedium = req.body.utm_medium || req.query.utm_medium;
            const utmCampaign = req.body.utm_campaign || req.query.utm_campaign;

            const result = await WaitlistService.addToWaitlist({
                email,
                ipAddress,
                utmSource,
                utmMedium,
                utmCampaign
            });

            res.status(result.alreadyExists ? 200 : 201).json({
                success: true,
                message: result.message,
                timestamp: result.timestamp
            });
        } catch (error) {
            logger.error(`Waitlist error: ${error.message}`);
            next(error);
        }
    }

    static async checkWaitlistHealth(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Waitlist system is operational',
                storage: 'Firebase Firestore',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error(`Waitlist health check error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Waitlist system health check failed',
                error: error.message
            });
        }
    }
}

module.exports = WaitlistController;