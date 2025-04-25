const WaitlistService = require('../services/waitlistService');
const logger = require('../utils/logger');

class WaitlistController {
    static async addToWaitlist(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required'
                });
            }

            const ipAddress = req.headers['x-forwarded-for'] ||
                req.headers['x-real-ip'] ||
                req.connection.remoteAddress ||
                req.ip ||
                null;

            const utmSource = req.body.utm_source || req.query.utm_source || null;
            const utmMedium = req.body.utm_medium || req.query.utm_medium || null;
            const utmCampaign = req.body.utm_campaign || req.query.utm_campaign || null;

            logger.info(`Processing waitlist signup for: ${email}`);

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
            logger.error(`Waitlist error: ${error.message}`, { stack: error.stack });

            const errorResponse = {
                success: false,
                error: error.message || 'An error occurred while processing your request'
            };

            const statusCode = error.status || error.statusCode || 500;

            res.status(statusCode).json(errorResponse);
        }
    }

    static async checkWaitlistHealth(req, res) {
        try {
            const { db } = require('../utils/firebase');

            res.status(200).json({
                success: true,
                message: 'Waitlist system is operational',
                storage: 'Firebase Firestore',
                dbConnected: !!db,
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