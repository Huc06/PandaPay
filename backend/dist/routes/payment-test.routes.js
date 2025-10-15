"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_test_controller_1 = require("../controllers/payment-test.controller");
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    return next();
};
const router = (0, express_1.Router)();
/**
 * @route   POST /api/payment/test/merchant-request
 * @desc    Create merchant payment request (for QR code generation)
 * @access  Public (Test endpoint)
 */
router.post('/merchant-request', [
    (0, express_validator_1.body)('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => parseFloat(value) > 0)
        .withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    validateRequest,
], payment_test_controller_1.paymentTestController.createMerchantRequest.bind(payment_test_controller_1.paymentTestController));
/**
 * @route   GET /api/payment/test/merchant-request/:requestId
 * @desc    Get merchant request by ID
 * @access  Public (Test endpoint)
 */
router.get('/merchant-request/:requestId', payment_test_controller_1.paymentTestController.getMerchantRequest.bind(payment_test_controller_1.paymentTestController));
/**
 * @route   PUT /api/payment/test/merchant-request/:requestId/status
 * @desc    Update merchant request status (simulated payment)
 * @access  Public (Test endpoint)
 */
router.put('/merchant-request/:requestId/status', [
    (0, express_validator_1.body)('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['scanned', 'processing', 'completed', 'failed'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('txHash')
        .optional()
        .isString()
        .withMessage('Transaction hash must be a string'),
    validateRequest,
], payment_test_controller_1.paymentTestController.updateMerchantRequestStatus.bind(payment_test_controller_1.paymentTestController));
exports.default = router;
//# sourceMappingURL=payment-test.routes.js.map