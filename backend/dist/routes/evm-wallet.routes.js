"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evm_wallet_controller_1 = require("../controllers/evm-wallet.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
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
 * @route   GET /api/evm-wallet/chains
 * @desc    Get all available EVM chains
 * @access  Public
 */
router.get('/chains', [
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['testnet', 'mainnet'])
        .withMessage('Type must be testnet or mainnet'),
    validateRequest,
], evm_wallet_controller_1.evmWalletController.getChains.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   POST /api/evm-wallet/create
 * @desc    Create a new EVM wallet for user
 * @access  Private
 */
router.post('/create', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
], validateRequest, evm_wallet_controller_1.evmWalletController.createWallet.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   POST /api/evm-wallet/import
 * @desc    Import EVM wallet from private key
 * @access  Private
 */
router.post('/import', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('privateKey')
        .notEmpty()
        .withMessage('Private key is required')
        .isString()
        .withMessage('Private key must be a string'),
    (0, express_validator_1.body)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
], validateRequest, evm_wallet_controller_1.evmWalletController.importWallet.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   POST /api/evm-wallet/export
 * @desc    Export EVM wallet (get private key)
 * @access  Private
 */
router.post('/export', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required for wallet export'),
], validateRequest, evm_wallet_controller_1.evmWalletController.exportWallet.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   GET /api/evm-wallet/balance/:chain/:address
 * @desc    Get EVM wallet balance
 * @access  Public
 */
router.get('/balance/:chain/:address', [
    (0, express_validator_1.param)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
    (0, express_validator_1.param)('address')
        .notEmpty()
        .withMessage('Address is required')
        .isString()
        .withMessage('Address must be a string'),
    validateRequest,
], evm_wallet_controller_1.evmWalletController.getBalance.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   GET /api/evm-wallet/info/:chain
 * @desc    Get user's EVM wallet info for specific chain
 * @access  Private
 */
router.get('/info/:chain', auth_middleware_1.authenticate, [
    (0, express_validator_1.param)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
], validateRequest, evm_wallet_controller_1.evmWalletController.getWalletInfo.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   POST /api/evm-wallet/transfer
 * @desc    Transfer native token (ETH, MATIC, BNB, etc.)
 * @access  Private
 */
router.post('/transfer', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
    (0, express_validator_1.body)('recipient')
        .notEmpty()
        .withMessage('Recipient address is required')
        .isString()
        .withMessage('Recipient must be a string'),
    (0, express_validator_1.body)('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isString()
        .withMessage('Amount must be a string'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('gasLimit')
        .optional()
        .isString()
        .withMessage('Gas limit must be a string'),
    (0, express_validator_1.body)('gasPrice')
        .optional()
        .isString()
        .withMessage('Gas price must be a string'),
], validateRequest, evm_wallet_controller_1.evmWalletController.transfer.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   POST /api/evm-wallet/estimate-gas
 * @desc    Estimate gas for transfer
 * @access  Private
 */
router.post('/estimate-gas', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
    (0, express_validator_1.body)('recipient')
        .notEmpty()
        .withMessage('Recipient address is required')
        .isString()
        .withMessage('Recipient must be a string'),
    (0, express_validator_1.body)('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isString()
        .withMessage('Amount must be a string'),
], validateRequest, evm_wallet_controller_1.evmWalletController.estimateGas.bind(evm_wallet_controller_1.evmWalletController));
/**
 * @route   GET /api/evm-wallet/transaction/:chain/:txHash
 * @desc    Get transaction details by hash
 * @access  Public
 */
router.get('/transaction/:chain/:txHash', [
    (0, express_validator_1.param)('chain')
        .notEmpty()
        .withMessage('Chain is required')
        .isString()
        .withMessage('Chain must be a string'),
    (0, express_validator_1.param)('txHash')
        .notEmpty()
        .withMessage('Transaction hash is required')
        .isString()
        .withMessage('Transaction hash must be a string'),
    validateRequest,
], evm_wallet_controller_1.evmWalletController.getTransaction.bind(evm_wallet_controller_1.evmWalletController));
exports.default = router;
//# sourceMappingURL=evm-wallet.routes.js.map