"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantValidators = void 0;
const express_validator_1 = require("express-validator");
exports.merchantValidators = {
    getMerchant: [
        (0, express_validator_1.param)('merchantId')
            .isMongoId()
            .withMessage('Valid merchant ID is required'),
    ],
    registerMerchant: [
        (0, express_validator_1.body)('businessName')
            .notEmpty()
            .withMessage('Business name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Business name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('email')
            .isEmail()
            .withMessage('Valid email is required'),
        (0, express_validator_1.body)('phone')
            .optional()
            .isMobilePhone('any')
            .withMessage('Valid phone number is required'),
        (0, express_validator_1.body)('businessType')
            .notEmpty()
            .withMessage('Business type is required'),
        (0, express_validator_1.body)('businessAddress')
            .notEmpty()
            .withMessage('Business address is required'),
    ],
    updateProfile: [
        (0, express_validator_1.body)('businessName')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Business name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('phone')
            .optional()
            .isMobilePhone('any')
            .withMessage('Valid phone number is required'),
        (0, express_validator_1.body)('businessAddress')
            .optional()
            .notEmpty()
            .withMessage('Business address cannot be empty'),
    ],
    updateMerchantProfile: [
        (0, express_validator_1.body)('businessName')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Business name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('phone')
            .optional()
            .isMobilePhone('any')
            .withMessage('Valid phone number is required'),
        (0, express_validator_1.body)('businessAddress')
            .optional()
            .notEmpty()
            .withMessage('Business address cannot be empty'),
    ],
    createWebhook: [
        (0, express_validator_1.body)('url')
            .isURL()
            .withMessage('Valid webhook URL is required'),
        (0, express_validator_1.body)('events')
            .isArray({ min: 1 })
            .withMessage('At least one event type is required'),
        (0, express_validator_1.body)('events.*')
            .isIn(['payment.created', 'payment.completed', 'payment.failed', 'refund.created'])
            .withMessage('Invalid event type'),
    ],
    updateWebhook: [
        (0, express_validator_1.param)('webhookId')
            .isMongoId()
            .withMessage('Valid webhook ID is required'),
        (0, express_validator_1.body)('url')
            .optional()
            .isURL()
            .withMessage('Valid webhook URL is required'),
        (0, express_validator_1.body)('events')
            .optional()
            .isArray({ min: 1 })
            .withMessage('At least one event type is required'),
    ],
    deleteWebhook: [
        (0, express_validator_1.param)('webhookId')
            .isMongoId()
            .withMessage('Valid webhook ID is required'),
    ],
    createApiKey: [
        (0, express_validator_1.body)('name')
            .notEmpty()
            .withMessage('API key name is required')
            .isLength({ min: 1, max: 50 })
            .withMessage('API key name must be between 1 and 50 characters'),
        (0, express_validator_1.body)('permissions')
            .optional()
            .isArray()
            .withMessage('Permissions must be an array'),
    ],
    deleteApiKey: [
        (0, express_validator_1.param)('keyId')
            .isMongoId()
            .withMessage('Valid API key ID is required'),
    ],
    refundPayment: [
        (0, express_validator_1.body)('paymentId')
            .isMongoId()
            .withMessage('Valid payment ID is required'),
        (0, express_validator_1.body)('amount')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('Refund amount must be greater than 0.01'),
        (0, express_validator_1.body)('reason')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Reason must not exceed 255 characters'),
    ],
    getMerchantPayments: [
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        (0, express_validator_1.query)('status')
            .optional()
            .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled'])
            .withMessage('Invalid payment status'),
    ],
    updateSettings: [
        (0, express_validator_1.body)('notifications')
            .optional()
            .isObject()
            .withMessage('Notifications must be an object'),
        (0, express_validator_1.body)('paymentMethods')
            .optional()
            .isArray()
            .withMessage('Payment methods must be an array'),
        (0, express_validator_1.body)('currency')
            .optional()
            .isIn(['USD', 'EUR', 'GBP', 'SUI'])
            .withMessage('Invalid currency'),
    ],
    updateMerchantSettings: [
        (0, express_validator_1.body)('notifications')
            .optional()
            .isObject()
            .withMessage('Notifications must be an object'),
        (0, express_validator_1.body)('paymentMethods')
            .optional()
            .isArray()
            .withMessage('Payment methods must be an array'),
        (0, express_validator_1.body)('currency')
            .optional()
            .isIn(['USD', 'EUR', 'GBP', 'SUI'])
            .withMessage('Invalid currency'),
    ],
    merchantId: [
        (0, express_validator_1.param)('merchantId')
            .isMongoId()
            .withMessage('Valid merchant ID is required'),
    ],
    updateMerchantStatus: [
        (0, express_validator_1.param)('merchantId')
            .isMongoId()
            .withMessage('Valid merchant ID is required'),
        (0, express_validator_1.body)('status')
            .isIn(['active', 'inactive', 'suspended', 'pending'])
            .withMessage('Invalid merchant status'),
    ],
    updateMerchantLimits: [
        (0, express_validator_1.param)('merchantId')
            .isMongoId()
            .withMessage('Valid merchant ID is required'),
        (0, express_validator_1.body)('dailyLimit')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Daily limit must be a positive number'),
        (0, express_validator_1.body)('monthlyLimit')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Monthly limit must be a positive number'),
    ],
};
//# sourceMappingURL=merchant.validator.js.map