"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const merchant_controller_1 = require("../controllers/merchant.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const merchant_validator_1 = require("../validators/merchant.validator");
const router = (0, express_1.Router)();
// Public routes
router.get('/public/:merchantId', (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.getMerchant), merchant_controller_1.merchantController.getPublicMerchantInfo);
// Authentication required for all other routes
router.use(auth_middleware_1.authenticate);
// Merchant management
router.post('/register', (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.registerMerchant), merchant_controller_1.merchantController.registerMerchant);
router.get('/profile', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getMerchantProfile);
router.put('/profile', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.updateProfile), merchant_controller_1.merchantController.updateMerchantProfile);
// Merchant payments
router.get('/payments', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getMerchantPayments);
router.get('/payments/stats', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getMerchantPaymentStats);
router.post('/payments/refund/:paymentId', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.refundPayment), merchant_controller_1.merchantController.refundPayment);
// Merchant settings
router.get('/settings', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getMerchantSettings);
router.put('/settings', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.updateSettings), merchant_controller_1.merchantController.updateMerchantSettings);
// Webhook management
router.get('/webhooks', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getWebhooks);
router.post('/webhooks', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.createWebhook), merchant_controller_1.merchantController.createWebhook);
router.put('/webhooks/:webhookId', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.updateWebhook), merchant_controller_1.merchantController.updateWebhook);
router.delete('/webhooks/:webhookId', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.deleteWebhook), merchant_controller_1.merchantController.deleteWebhook);
// API Keys management
router.get('/api-keys', (0, auth_middleware_1.authorize)('merchant', 'admin'), merchant_controller_1.merchantController.getApiKeys);
router.post('/api-keys', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.createApiKey), merchant_controller_1.merchantController.createApiKey);
router.delete('/api-keys/:keyId', (0, auth_middleware_1.authorize)('merchant', 'admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.deleteApiKey), merchant_controller_1.merchantController.deleteApiKey);
// Admin routes
router.get('/admin/all', (0, auth_middleware_1.authorize)('admin'), merchant_controller_1.merchantController.getAllMerchants);
router.put('/admin/:merchantId/status', (0, auth_middleware_1.authorize)('admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.updateMerchantStatus), merchant_controller_1.merchantController.updateMerchantStatus);
router.put('/admin/:merchantId/limits', (0, auth_middleware_1.authorize)('admin'), (0, validation_middleware_1.validate)(merchant_validator_1.merchantValidators.updateMerchantLimits), merchant_controller_1.merchantController.updateMerchantLimits);
exports.default = router;
//# sourceMappingURL=merchant.routes.js.map