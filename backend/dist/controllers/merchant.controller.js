"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantController = exports.MerchantController = void 0;
const Merchant_model_1 = require("../models/Merchant.model");
const logger_1 = __importDefault(require("../utils/logger"));
class MerchantController {
    async getPublicMerchantInfo(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async registerMerchant(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getMerchantProfile(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            // Find merchant record by email
            const merchant = await Merchant_model_1.Merchant.findOne({ email: user.email })
                .select('+apiKeys.secretKey +apiKeys.webhookSecret');
            if (!merchant) {
                return res.status(404).json({
                    success: false,
                    error: 'Merchant profile not found. Please complete merchant registration.'
                });
            }
            return res.json({
                success: true,
                id: merchant._id,
                merchantId: merchant.merchantId,
                merchantName: merchant.merchantName,
                businessType: merchant.businessType,
                email: merchant.email,
                phoneNumber: merchant.phoneNumber,
                walletAddress: merchant.evmWalletAddress || merchant.walletAddress,
                address: merchant.address,
                apiKeys: {
                    publicKey: merchant.apiKeys.publicKey,
                    secretKey: merchant.apiKeys.secretKey,
                },
                webhookUrl: merchant.webhookUrl,
                isActive: merchant.isActive,
                isVerified: merchant.isVerified,
                commission: merchant.commission,
                settlementPeriod: merchant.settlementPeriod,
                totalTransactions: merchant.totalTransactions,
                totalVolume: merchant.totalVolume
            });
        }
        catch (error) {
            logger_1.default.error('Get merchant profile error:', error);
            next(error);
        }
    }
    async updateMerchantProfile(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getMerchantPayments(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getMerchantPaymentStats(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async refundPayment(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getMerchantSettings(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMerchantSettings(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getWebhooks(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async createWebhook(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async updateWebhook(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteWebhook(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getApiKeys(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async createApiKey(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteApiKey(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllMerchants(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMerchantStatus(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMerchantLimits(_req, res, next) {
        try {
            res.json({ success: true, message: 'Merchant controller method not implemented yet' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MerchantController = MerchantController;
exports.merchantController = new MerchantController();
//# sourceMappingURL=merchant.controller.js.map