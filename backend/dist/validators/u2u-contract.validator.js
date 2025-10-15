"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.u2uContractValidators = void 0;
const express_validator_1 = require("express-validator");
exports.u2uContractValidators = {
    registerMerchant: [
        (0, express_validator_1.body)('businessName')
            .trim()
            .notEmpty()
            .withMessage('Business name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Business name must be between 3 and 100 characters'),
        (0, express_validator_1.body)('privateKey')
            .trim()
            .notEmpty()
            .withMessage('Private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    createPayment: [
        (0, express_validator_1.body)('merchantAddress')
            .trim()
            .notEmpty()
            .withMessage('Merchant address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid merchant address format'),
        (0, express_validator_1.body)('amount')
            .trim()
            .notEmpty()
            .withMessage('Amount is required')
            .isDecimal()
            .withMessage('Amount must be a valid number')
            .custom((value) => {
            const num = parseFloat(value);
            if (num <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            return true;
        }),
        (0, express_validator_1.body)('paymentMethod')
            .trim()
            .notEmpty()
            .withMessage('Payment method is required')
            .isIn(['POS', 'QR'])
            .withMessage('Payment method must be POS or QR'),
        (0, express_validator_1.body)('privateKey')
            .trim()
            .notEmpty()
            .withMessage('Private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    confirmPayment: [
        (0, express_validator_1.body)('transactionId')
            .notEmpty()
            .withMessage('Transaction ID is required')
            .isInt({ min: 0 })
            .withMessage('Transaction ID must be a positive integer'),
        (0, express_validator_1.body)('privateKey')
            .trim()
            .notEmpty()
            .withMessage('Private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    refundPayment: [
        (0, express_validator_1.body)('transactionId')
            .notEmpty()
            .withMessage('Transaction ID is required')
            .isInt({ min: 0 })
            .withMessage('Transaction ID must be a positive integer'),
        (0, express_validator_1.body)('privateKey')
            .trim()
            .notEmpty()
            .withMessage('Private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    getMerchantInfo: [
        (0, express_validator_1.param)('address')
            .trim()
            .notEmpty()
            .withMessage('Merchant address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid merchant address format'),
    ],
    getTransactionDetails: [
        (0, express_validator_1.param)('id')
            .notEmpty()
            .withMessage('Transaction ID is required')
            .isInt({ min: 0 })
            .withMessage('Transaction ID must be a positive integer'),
    ],
    getMerchantTransactions: [
        (0, express_validator_1.param)('address')
            .trim()
            .notEmpty()
            .withMessage('Merchant address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid merchant address format'),
    ],
    getUserTransactions: [
        (0, express_validator_1.param)('address')
            .trim()
            .notEmpty()
            .withMessage('User address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid user address format'),
    ],
    deactivateMerchant: [
        (0, express_validator_1.param)('address')
            .trim()
            .notEmpty()
            .withMessage('Merchant address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid merchant address format'),
        (0, express_validator_1.body)('ownerPrivateKey')
            .trim()
            .notEmpty()
            .withMessage('Owner private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    updatePlatformFee: [
        (0, express_validator_1.body)('newFeePercent')
            .notEmpty()
            .withMessage('New fee percent is required')
            .isInt({ min: 0, max: 100 })
            .withMessage('Fee percent must be between 0 and 100'),
        (0, express_validator_1.body)('ownerPrivateKey')
            .trim()
            .notEmpty()
            .withMessage('Owner private key is required')
            .matches(/^0x[0-9a-fA-F]{64}$/)
            .withMessage('Invalid private key format'),
    ],
    // Authenticated user endpoints (no private key required, uses stored key)
    createPaymentForUser: [
        (0, express_validator_1.body)('merchantAddress')
            .trim()
            .notEmpty()
            .withMessage('Merchant address is required')
            .matches(/^0x[0-9a-fA-F]{40}$/)
            .withMessage('Invalid merchant address format'),
        (0, express_validator_1.body)('amount')
            .trim()
            .notEmpty()
            .withMessage('Amount is required')
            .isDecimal()
            .withMessage('Amount must be a valid number')
            .custom((value) => {
            const num = parseFloat(value);
            if (num <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            return true;
        }),
        (0, express_validator_1.body)('paymentMethod')
            .trim()
            .notEmpty()
            .withMessage('Payment method is required')
            .isIn(['POS', 'QR'])
            .withMessage('Payment method must be POS or QR'),
    ],
    confirmPaymentForMerchant: [
        (0, express_validator_1.body)('transactionId')
            .notEmpty()
            .withMessage('Transaction ID is required')
            .isInt({ min: 0 })
            .withMessage('Transaction ID must be a positive integer'),
    ],
    registerMerchantForUser: [
        (0, express_validator_1.body)('businessName')
            .trim()
            .notEmpty()
            .withMessage('Business name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Business name must be between 3 and 100 characters'),
    ],
};
//# sourceMappingURL=u2u-contract.validator.js.map