"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const u2u_contract_controller_1 = require("../controllers/u2u-contract.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const u2u_contract_validator_1 = require("../validators/u2u-contract.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public endpoints
// Get contract information
router.get('/info', u2u_contract_controller_1.U2UContractController.getContractInfo);
// Get platform statistics
router.get('/stats', u2u_contract_controller_1.U2UContractController.getPlatformStats);
// Merchant endpoints
router.post('/merchant/register', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.registerMerchant), u2u_contract_controller_1.U2UContractController.registerMerchant);
router.get('/merchant/:address', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.getMerchantInfo), u2u_contract_controller_1.U2UContractController.getMerchantInfo);
router.get('/merchant/:address/transactions', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.getMerchantTransactions), u2u_contract_controller_1.U2UContractController.getMerchantTransactions);
// Admin-only: Deactivate merchant
router.post('/merchant/:address/deactivate', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.deactivateMerchant), u2u_contract_controller_1.U2UContractController.deactivateMerchant);
// Payment endpoints
router.post('/payment/create', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.createPayment), u2u_contract_controller_1.U2UContractController.createPayment);
router.post('/payment/confirm', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.confirmPayment), u2u_contract_controller_1.U2UContractController.confirmPayment);
router.post('/payment/refund', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.refundPayment), u2u_contract_controller_1.U2UContractController.refundPayment);
// Transaction endpoints
router.get('/transaction/:id', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.getTransactionDetails), u2u_contract_controller_1.U2UContractController.getTransactionDetails);
// User endpoints
router.get('/user/:address/transactions', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.getUserTransactions), u2u_contract_controller_1.U2UContractController.getUserTransactions);
// Platform management (admin only)
router.post('/platform/fee', (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.updatePlatformFee), u2u_contract_controller_1.U2UContractController.updatePlatformFee);
// Authenticated user endpoints (using stored encrypted private keys)
// These endpoints decrypt the user's private key from the database
router.post('/payment/create-for-user', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.createPaymentForUser), u2u_contract_controller_1.U2UContractController.createPaymentForUser);
router.post('/payment/confirm-for-merchant', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.confirmPaymentForMerchant), u2u_contract_controller_1.U2UContractController.confirmPaymentForMerchant);
router.post('/merchant/register-for-user', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(u2u_contract_validator_1.u2uContractValidators.registerMerchantForUser), u2u_contract_controller_1.U2UContractController.registerMerchantForUser);
exports.default = router;
//# sourceMappingURL=u2u-contract.routes.js.map