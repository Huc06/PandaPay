"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.U2UContractController = void 0;
const u2u_contract_service_1 = require("../services/u2u-contract.service");
const User_model_1 = require("../models/User.model");
const encryption_service_1 = require("../services/encryption.service");
const logger_1 = __importDefault(require("../utils/logger"));
class U2UContractController {
    /**
     * Register a new merchant
     * POST /api/u2u-contract/merchant/register
     */
    static async registerMerchant(req, res) {
        try {
            const { businessName, privateKey } = req.body;
            if (!businessName || !privateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Business name and private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.registerMerchant({
                businessName,
                privateKey,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Merchant registered successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Register merchant error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to register merchant',
            });
        }
    }
    /**
     * Create a payment
     * POST /api/u2u-contract/payment/create
     */
    static async createPayment(req, res) {
        try {
            const { merchantAddress, amount, paymentMethod, privateKey } = req.body;
            if (!merchantAddress || !amount || !paymentMethod || !privateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Merchant address, amount, payment method, and private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.createPayment({
                merchantAddress,
                amount,
                paymentMethod,
                privateKey,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Payment created successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Create payment error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create payment',
            });
        }
    }
    /**
     * Confirm a payment
     * POST /api/u2u-contract/payment/confirm
     */
    static async confirmPayment(req, res) {
        try {
            const { transactionId, privateKey } = req.body;
            if (transactionId === undefined || !privateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction ID and private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.confirmPayment({
                transactionId: Number(transactionId),
                privateKey,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Payment confirmed successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Confirm payment error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to confirm payment',
            });
        }
    }
    /**
     * Refund a payment
     * POST /api/u2u-contract/payment/refund
     */
    static async refundPayment(req, res) {
        try {
            const { transactionId, privateKey } = req.body;
            if (transactionId === undefined || !privateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction ID and private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.refundPayment({
                transactionId: Number(transactionId),
                privateKey,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Payment refunded successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Refund payment error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refund payment',
            });
        }
    }
    /**
     * Get merchant information
     * GET /api/u2u-contract/merchant/:address
     */
    static async getMerchantInfo(req, res) {
        try {
            const { address } = req.params;
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Merchant address is required',
                });
            }
            const merchantInfo = await u2u_contract_service_1.U2UContractService.getMerchantInfo(address);
            // Format the revenue for display
            const formattedRevenue = u2u_contract_service_1.U2UContractService.formatAmount(merchantInfo.totalRevenue);
            return res.json({
                success: true,
                data: {
                    ...merchantInfo,
                    totalRevenueFormatted: `${formattedRevenue} U2U`,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get merchant info error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get merchant information',
            });
        }
    }
    /**
     * Get transaction details
     * GET /api/u2u-contract/transaction/:id
     */
    static async getTransactionDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction ID is required',
                });
            }
            const transaction = await u2u_contract_service_1.U2UContractService.getTransactionDetails(Number(id));
            // Format the amount for display
            const formattedAmount = u2u_contract_service_1.U2UContractService.formatAmount(transaction.amount);
            return res.json({
                success: true,
                data: {
                    ...transaction,
                    amountFormatted: `${formattedAmount} U2U`,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get transaction details error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get transaction details',
            });
        }
    }
    /**
     * Get merchant transactions
     * GET /api/u2u-contract/merchant/:address/transactions
     */
    static async getMerchantTransactions(req, res) {
        try {
            const { address } = req.params;
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Merchant address is required',
                });
            }
            const transactionIds = await u2u_contract_service_1.U2UContractService.getMerchantTransactions(address);
            return res.json({
                success: true,
                data: {
                    merchantAddress: address,
                    transactionIds,
                    count: transactionIds.length,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get merchant transactions error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get merchant transactions',
            });
        }
    }
    /**
     * Get user transactions
     * GET /api/u2u-contract/user/:address/transactions
     */
    static async getUserTransactions(req, res) {
        try {
            const { address } = req.params;
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'User address is required',
                });
            }
            const transactionIds = await u2u_contract_service_1.U2UContractService.getUserTransactions(address);
            return res.json({
                success: true,
                data: {
                    userAddress: address,
                    transactionIds,
                    count: transactionIds.length,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get user transactions error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user transactions',
            });
        }
    }
    /**
     * Get platform statistics
     * GET /api/u2u-contract/stats
     */
    static async getPlatformStats(_req, res) {
        try {
            const feePercent = await u2u_contract_service_1.U2UContractService.getPlatformFeePercent();
            const transactionCounter = await u2u_contract_service_1.U2UContractService.getTransactionCounter();
            const contractAddress = u2u_contract_service_1.U2UContractService.getContractAddress();
            const chainConfig = u2u_contract_service_1.U2UContractService.getChainConfig();
            return res.json({
                success: true,
                data: {
                    platformFeePercent: feePercent,
                    totalTransactions: transactionCounter,
                    contractAddress,
                    chain: {
                        name: chainConfig.name,
                        chainId: chainConfig.chainId,
                        symbol: chainConfig.symbol,
                        explorerUrl: chainConfig.explorerUrl,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get platform stats error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get platform statistics',
            });
        }
    }
    /**
     * Deactivate merchant (admin only)
     * POST /api/u2u-contract/merchant/:address/deactivate
     */
    static async deactivateMerchant(req, res) {
        try {
            const { address } = req.params;
            const { ownerPrivateKey } = req.body;
            if (!address || !ownerPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Merchant address and owner private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.deactivateMerchant(address, ownerPrivateKey);
            return res.json({
                success: true,
                data: result,
                message: 'Merchant deactivated successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Deactivate merchant error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to deactivate merchant',
            });
        }
    }
    /**
     * Update platform fee (admin only)
     * POST /api/u2u-contract/platform/fee
     */
    static async updatePlatformFee(req, res) {
        try {
            const { newFeePercent, ownerPrivateKey } = req.body;
            if (newFeePercent === undefined || !ownerPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'New fee percent and owner private key are required',
                });
            }
            const result = await u2u_contract_service_1.U2UContractService.updatePlatformFee(Number(newFeePercent), ownerPrivateKey);
            return res.json({
                success: true,
                data: result,
                message: 'Platform fee updated successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Update platform fee error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update platform fee',
            });
        }
    }
    /**
     * Get contract information
     * GET /api/u2u-contract/info
     */
    static async getContractInfo(_req, res) {
        try {
            const contractAddress = u2u_contract_service_1.U2UContractService.getContractAddress();
            const chainConfig = u2u_contract_service_1.U2UContractService.getChainConfig();
            return res.json({
                success: true,
                data: {
                    contractAddress,
                    explorerUrl: `${chainConfig.explorerUrl}/address/${contractAddress}`,
                    chain: {
                        name: chainConfig.name,
                        chainId: chainConfig.chainId,
                        symbol: chainConfig.symbol,
                        rpcUrl: chainConfig.rpcUrl,
                        explorerUrl: chainConfig.explorerUrl,
                        isTestnet: chainConfig.isTestnet,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get contract info error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get contract information',
            });
        }
    }
    /**
     * Create payment for authenticated user (using stored private key)
     * POST /api/u2u-contract/payment/create-for-user
     */
    static async createPaymentForUser(req, res) {
        try {
            const userId = req.user?.id;
            const { merchantAddress, amount, paymentMethod } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                });
            }
            if (!merchantAddress || !amount || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    error: 'Merchant address, amount, and payment method are required',
                });
            }
            // Get user with encrypted private key
            const user = await User_model_1.User.findById(userId).select('+evmEncryptedPrivateKey');
            if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'User does not have a U2U wallet. Please create one first.',
                });
            }
            // Decrypt private key
            const privateKey = (0, encryption_service_1.decryptPrivateKey)(user.evmEncryptedPrivateKey);
            // Create payment using U2U Contract
            const result = await u2u_contract_service_1.U2UContractService.createPayment({
                merchantAddress,
                amount,
                paymentMethod,
                privateKey,
            });
            logger_1.default.info('Payment created for user:', {
                userId: user._id,
                userAddress: user.evmWalletAddress,
                merchantAddress,
                amount,
                txHash: result.txHash,
                transactionId: result.transactionId,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Payment created successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Create payment for user error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create payment',
            });
        }
    }
    /**
     * Confirm payment for authenticated merchant (using stored private key)
     * POST /api/u2u-contract/payment/confirm-for-merchant
     */
    static async confirmPaymentForMerchant(req, res) {
        try {
            const userId = req.user?.id;
            const { transactionId } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                });
            }
            if (transactionId === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction ID is required',
                });
            }
            // Get user with encrypted private key
            const user = await User_model_1.User.findById(userId).select('+evmEncryptedPrivateKey');
            if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'User does not have a U2U wallet',
                });
            }
            // Decrypt private key
            const privateKey = (0, encryption_service_1.decryptPrivateKey)(user.evmEncryptedPrivateKey);
            // Confirm payment
            const result = await u2u_contract_service_1.U2UContractService.confirmPayment({
                transactionId: Number(transactionId),
                privateKey,
            });
            logger_1.default.info('Payment confirmed by merchant:', {
                userId: user._id,
                merchantAddress: user.evmWalletAddress,
                transactionId,
                txHash: result.txHash,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Payment confirmed successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Confirm payment for merchant error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to confirm payment',
            });
        }
    }
    /**
     * Register merchant for authenticated user (using stored private key)
     * POST /api/u2u-contract/merchant/register-for-user
     */
    static async registerMerchantForUser(req, res) {
        try {
            const userId = req.user?.id;
            const { businessName } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated',
                });
            }
            if (!businessName) {
                return res.status(400).json({
                    success: false,
                    error: 'Business name is required',
                });
            }
            // Get user with encrypted private key
            const user = await User_model_1.User.findById(userId).select('+evmEncryptedPrivateKey');
            if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'User does not have a U2U wallet. Please create one first.',
                });
            }
            // Decrypt private key
            const privateKey = (0, encryption_service_1.decryptPrivateKey)(user.evmEncryptedPrivateKey);
            // Register merchant
            const result = await u2u_contract_service_1.U2UContractService.registerMerchant({
                businessName,
                privateKey,
            });
            logger_1.default.info('Merchant registered for user:', {
                userId: user._id,
                merchantAddress: user.evmWalletAddress,
                businessName,
                txHash: result.txHash,
            });
            return res.json({
                success: true,
                data: result,
                message: 'Merchant registered successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Register merchant for user error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to register merchant',
            });
        }
    }
}
exports.U2UContractController = U2UContractController;
//# sourceMappingURL=u2u-contract.controller.js.map