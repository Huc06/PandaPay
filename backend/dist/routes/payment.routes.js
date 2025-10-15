"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const payment_validator_1 = require("../validators/payment.validator");
const payment_test_routes_1 = __importDefault(require("./payment-test.routes"));
const router = (0, express_1.Router)();
// Test routes (no authentication required)
router.use('/test', payment_test_routes_1.default);
// Public routes
router.post('/validate', (0, validation_middleware_1.validate)(payment_validator_1.paymentValidators.validatePayment), payment_controller_1.paymentController.validatePayment);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/process', rateLimit_middleware_1.paymentLimiter, (0, validation_middleware_1.validate)(payment_validator_1.paymentValidators.processPayment), payment_controller_1.paymentController.processPayment);
router.post('/sign', (0, validation_middleware_1.validate)(payment_validator_1.paymentValidators.signTransaction), payment_controller_1.paymentController.signTransaction);
router.post('/complete', (0, validation_middleware_1.validate)(payment_validator_1.paymentValidators.completePayment), payment_controller_1.paymentController.completePayment);
router.get('/transactions', payment_controller_1.paymentController.getTransactionHistory);
router.get('/transactions/:id', payment_controller_1.paymentController.getTransaction);
router.post('/transactions/:id/refund', (0, auth_middleware_1.authorize)('admin', 'merchant'), payment_controller_1.paymentController.refundTransaction);
router.get('/stats', payment_controller_1.paymentController.getPaymentStats);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map