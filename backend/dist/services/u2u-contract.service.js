"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.U2UContractService = exports.TransactionStatus = void 0;
const ethers_1 = require("ethers");
const evm_config_1 = require("../config/evm.config");
const logger_1 = __importDefault(require("../utils/logger"));
const contract_json_1 = __importDefault(require("../../abi/contract.json"));
const contractABI = contract_json_1.default;
const CONTRACT_ADDRESS = process.env.U2U_CONTRACT_ADDRESS || '0xbCB10Bb393215BdC90b7d913604C00A558997cee';
// Transaction Status Enum (matching smart contract)
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["Pending"] = 0] = "Pending";
    TransactionStatus[TransactionStatus["Completed"] = 1] = "Completed";
    TransactionStatus[TransactionStatus["Refunded"] = 2] = "Refunded";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class U2UContractService {
    static contract;
    static provider;
    static chainConfig;
    /**
     * Initialize contract service
     */
    static initialize(chainKey = 'u2u') {
        const config = (0, evm_config_1.getEVMChain)(chainKey);
        if (!config) {
            throw new Error(`Chain configuration not found for: ${chainKey}`);
        }
        this.chainConfig = config;
        this.provider = new ethers_1.ethers.JsonRpcProvider(config.rpcUrl);
        this.contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider);
        logger_1.default.info('U2U Contract Service initialized', {
            chain: config.name,
            contractAddress: CONTRACT_ADDRESS,
        });
    }
    /**
     * Get contract instance with signer
     */
    static getContractWithSigner(privateKey) {
        const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        return this.contract.connect(wallet);
    }
    /**
     * Register a new merchant
     */
    static async registerMerchant(params) {
        try {
            const { businessName, privateKey } = params;
            const contractWithSigner = this.getContractWithSigner(privateKey);
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            logger_1.default.info('Registering merchant', { businessName, address: wallet.address });
            const tx = await contractWithSigner.registerMerchant(businessName);
            const receipt = await tx.wait();
            logger_1.default.info('Merchant registered successfully', {
                txHash: receipt.hash,
                merchantAddress: wallet.address,
            });
            return {
                success: true,
                txHash: receipt.hash,
                merchantAddress: wallet.address,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to register merchant:', error);
            throw new Error('Failed to register merchant');
        }
    }
    /**
     * Create a payment
     */
    static async createPayment(params) {
        try {
            const { merchantAddress, amount, paymentMethod, privateKey } = params;
            const contractWithSigner = this.getContractWithSigner(privateKey);
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            // Convert amount to Wei
            const amountInWei = ethers_1.ethers.parseUnits(amount, 18);
            logger_1.default.info('Creating payment', {
                from: wallet.address,
                merchant: merchantAddress,
                amount,
                paymentMethod,
            });
            // Send transaction with value
            const tx = await contractWithSigner.createPayment(merchantAddress, paymentMethod, {
                value: amountInWei,
            });
            const receipt = await tx.wait();
            // Parse events to get transaction ID
            let transactionId = 0;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = this.contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data,
                    });
                    if (parsedLog && parsedLog.name === 'PaymentInitiated') {
                        transactionId = Number(parsedLog.args.transactionId);
                        break;
                    }
                }
                catch (e) {
                    // Skip logs that don't match our ABI
                    continue;
                }
            }
            logger_1.default.info('Payment created successfully', {
                txHash: receipt.hash,
                transactionId,
            });
            return {
                success: true,
                txHash: receipt.hash,
                transactionId,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to create payment:', error);
            throw new Error('Failed to create payment');
        }
    }
    /**
     * Confirm a payment (merchant only)
     */
    static async confirmPayment(params) {
        try {
            const { transactionId, privateKey } = params;
            const contractWithSigner = this.getContractWithSigner(privateKey);
            logger_1.default.info('Confirming payment', { transactionId });
            const tx = await contractWithSigner.confirmPayment(transactionId);
            const receipt = await tx.wait();
            logger_1.default.info('Payment confirmed successfully', {
                txHash: receipt.hash,
                transactionId,
            });
            return {
                success: true,
                txHash: receipt.hash,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to confirm payment:', error);
            throw new Error('Failed to confirm payment');
        }
    }
    /**
     * Refund a payment (merchant only)
     */
    static async refundPayment(params) {
        try {
            const { transactionId, privateKey } = params;
            const contractWithSigner = this.getContractWithSigner(privateKey);
            logger_1.default.info('Refunding payment', { transactionId });
            const tx = await contractWithSigner.refundPayment(transactionId);
            const receipt = await tx.wait();
            logger_1.default.info('Payment refunded successfully', {
                txHash: receipt.hash,
                transactionId,
            });
            return {
                success: true,
                txHash: receipt.hash,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to refund payment:', error);
            throw new Error('Failed to refund payment');
        }
    }
    /**
     * Get merchant information
     */
    static async getMerchantInfo(merchantAddress) {
        try {
            const result = await this.contract.getMerchantInfo(merchantAddress);
            return {
                businessName: result.businessName,
                isActive: result.isActive,
                totalTransactions: Number(result.totalTransactions),
                totalRevenue: result.totalRevenue.toString(),
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get merchant info:', error);
            throw new Error('Failed to get merchant information');
        }
    }
    /**
     * Get transaction details
     */
    static async getTransactionDetails(transactionId) {
        try {
            const result = await this.contract.getTransactionDetails(transactionId);
            return {
                transactionId,
                merchant: result.merchant,
                user: result.user,
                amount: result.amount.toString(),
                timestamp: Number(result.timestamp),
                paymentMethod: result.paymentMethod,
                status: Number(result.status),
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction details:', error);
            throw new Error('Failed to get transaction details');
        }
    }
    /**
     * Get merchant transactions
     */
    static async getMerchantTransactions(merchantAddress) {
        try {
            const result = await this.contract.getMerchantTransactions(merchantAddress);
            return result.map((id) => Number(id));
        }
        catch (error) {
            logger_1.default.error('Failed to get merchant transactions:', error);
            throw new Error('Failed to get merchant transactions');
        }
    }
    /**
     * Get user transactions
     */
    static async getUserTransactions(userAddress) {
        try {
            const result = await this.contract.getUserTransactions(userAddress);
            return result.map((id) => Number(id));
        }
        catch (error) {
            logger_1.default.error('Failed to get user transactions:', error);
            throw new Error('Failed to get user transactions');
        }
    }
    /**
     * Get platform fee percentage
     */
    static async getPlatformFeePercent() {
        try {
            const result = await this.contract.platformFeePercent();
            return Number(result);
        }
        catch (error) {
            logger_1.default.error('Failed to get platform fee:', error);
            throw new Error('Failed to get platform fee');
        }
    }
    /**
     * Get transaction counter
     */
    static async getTransactionCounter() {
        try {
            const result = await this.contract.transactionCounter();
            return Number(result);
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction counter:', error);
            throw new Error('Failed to get transaction counter');
        }
    }
    /**
     * Deactivate merchant (owner only)
     */
    static async deactivateMerchant(merchantAddress, ownerPrivateKey) {
        try {
            const contractWithSigner = this.getContractWithSigner(ownerPrivateKey);
            logger_1.default.info('Deactivating merchant', { merchantAddress });
            const tx = await contractWithSigner.deactivateMerchant(merchantAddress);
            const receipt = await tx.wait();
            logger_1.default.info('Merchant deactivated successfully', {
                txHash: receipt.hash,
                merchantAddress,
            });
            return {
                success: true,
                txHash: receipt.hash,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to deactivate merchant:', error);
            throw new Error('Failed to deactivate merchant');
        }
    }
    /**
     * Update platform fee (owner only)
     */
    static async updatePlatformFee(newFeePercent, ownerPrivateKey) {
        try {
            const contractWithSigner = this.getContractWithSigner(ownerPrivateKey);
            logger_1.default.info('Updating platform fee', { newFeePercent });
            const tx = await contractWithSigner.updatePlatformFee(newFeePercent);
            const receipt = await tx.wait();
            logger_1.default.info('Platform fee updated successfully', {
                txHash: receipt.hash,
                newFeePercent,
            });
            return {
                success: true,
                txHash: receipt.hash,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to update platform fee:', error);
            throw new Error('Failed to update platform fee');
        }
    }
    /**
     * Get contract address
     */
    static getContractAddress() {
        return CONTRACT_ADDRESS;
    }
    /**
     * Get chain config
     */
    static getChainConfig() {
        return this.chainConfig;
    }
    /**
     * Format amount from Wei to U2U
     */
    static formatAmount(amountInWei) {
        return ethers_1.ethers.formatUnits(amountInWei, 18);
    }
    /**
     * Parse amount from U2U to Wei
     */
    static parseAmount(amount) {
        return ethers_1.ethers.parseUnits(amount, 18).toString();
    }
}
exports.U2UContractService = U2UContractService;
//# sourceMappingURL=u2u-contract.service.js.map