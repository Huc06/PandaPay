"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evmWalletController = exports.EVMWalletController = void 0;
const evm_wallet_service_1 = require("../services/evm-wallet.service");
const evm_config_1 = require("../config/evm.config");
const User_model_1 = require("../models/User.model");
const Transaction_model_1 = require("../models/Transaction.model");
const encryption_service_1 = require("../services/encryption.service");
const constants_1 = require("../config/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class EVMWalletController {
    /**
     * Get all available EVM chains
     */
    async getChains(req, res, next) {
        try {
            const { type } = req.query;
            let chains;
            if (type === 'testnet') {
                chains = (0, evm_config_1.getTestnetChains)();
            }
            else if (type === 'mainnet') {
                chains = (0, evm_config_1.getMainnetChains)();
            }
            else {
                chains = (0, evm_config_1.getAllEVMChains)();
            }
            res.json({
                success: true,
                chains: chains.map(chain => ({
                    name: chain.name,
                    chainId: chain.chainId,
                    symbol: chain.symbol,
                    decimals: chain.decimals,
                    explorerUrl: chain.explorerUrl,
                    isTestnet: chain.isTestnet,
                })),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a new EVM wallet for user
     */
    async createWallet(req, res, next) {
        try {
            const userId = req.user.id;
            const { chain } = req.body;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Check if user already has an EVM wallet
            const user = await User_model_1.User.findById(userId);
            if (user?.evmWalletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'User already has an EVM wallet',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Create new wallet
            const wallet = evm_wallet_service_1.EVMWalletService.createWallet();
            // Encrypt and store private key
            const encryptedPrivateKey = (0, encryption_service_1.encryptPrivateKey)(wallet.privateKey);
            // Update user with wallet info
            user.evmWalletAddress = wallet.address;
            user.evmEncryptedPrivateKey = encryptedPrivateKey;
            await user.save();
            logger_1.default.info('EVM wallet created:', {
                userId: user._id,
                address: wallet.address,
                chain: chainConfig.name,
            });
            res.json({
                success: true,
                message: 'EVM wallet created successfully',
                wallet: {
                    address: wallet.address,
                    publicKey: wallet.publicKey,
                    explorerUrl: `${chainConfig.explorerUrl}/address/${wallet.address}`,
                },
            });
        }
        catch (error) {
            logger_1.default.error('EVM wallet creation error:', error);
            next(error);
        }
    }
    /**
     * Get EVM wallet balance
     */
    async getBalance(req, res, next) {
        try {
            const { address, chain } = req.params;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Validate address
            if (!evm_wallet_service_1.EVMWalletService.isValidAddress(address)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid EVM address',
                    code: constants_1.ERROR_CODES.INVALID_INPUT,
                });
            }
            // Get balance
            const balanceInfo = await evm_wallet_service_1.EVMWalletService.getBalance(address, chainConfig);
            const result = {
                address,
                balance: balanceInfo.balance,
                balanceInWei: balanceInfo.balanceInWei,
                symbol: balanceInfo.symbol,
                decimals: balanceInfo.decimals,
                chain: {
                    name: chainConfig.name,
                    chainId: chainConfig.chainId,
                },
                explorerUrl: `${chainConfig.explorerUrl}/address/${address}`,
            };
            res.json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            logger_1.default.error('Get balance error:', error);
            next(error);
        }
    }
    /**
     * Transfer native token (ETH, MATIC, BNB, etc.)
     */
    async transfer(req, res, next) {
        try {
            const { chain, recipient, amount, description, gasLimit, gasPrice } = req.body;
            const userId = req.user.id;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Input validation
            if (!recipient || !amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: recipient, amount',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            if (!evm_wallet_service_1.EVMWalletService.isValidAddress(recipient)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid recipient address',
                    code: constants_1.ERROR_CODES.INVALID_INPUT,
                });
            }
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid amount',
                    code: constants_1.ERROR_CODES.INVALID_INPUT,
                });
            }
            // Get user with encrypted private key
            const user = await User_model_1.User.findById(userId).select('+evmEncryptedPrivateKey');
            if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'EVM wallet not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Check wallet balance
            const balanceInfo = await evm_wallet_service_1.EVMWalletService.getBalance(user.evmWalletAddress, chainConfig);
            const walletBalance = parseFloat(balanceInfo.balance);
            // Estimate gas
            let estimatedGas;
            let currentGasPrice;
            try {
                estimatedGas = await evm_wallet_service_1.EVMWalletService.estimateGas(user.evmWalletAddress, recipient, amount, chainConfig);
                currentGasPrice = await evm_wallet_service_1.EVMWalletService.getGasPrice(chainConfig);
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Failed to estimate gas. Please check your balance and try again.',
                    code: constants_1.ERROR_CODES.INTERNAL_ERROR,
                });
            }
            const estimatedGasFee = parseFloat((Number(estimatedGas) * Number(currentGasPrice) / 1e18).toFixed(8));
            const totalRequired = amountNum + estimatedGasFee;
            if (walletBalance < totalRequired) {
                return res.status(400).json({
                    success: false,
                    error: 'Insufficient balance',
                    code: constants_1.ERROR_CODES.INSUFFICIENT_BALANCE,
                    details: {
                        walletBalance,
                        requiredAmount: totalRequired,
                        transferAmount: amountNum,
                        estimatedGasFee,
                        symbol: chainConfig.symbol,
                    },
                });
            }
            // Decrypt private key
            const privateKey = (0, encryption_service_1.decryptPrivateKey)(user.evmEncryptedPrivateKey);
            // Execute transfer
            const result = await evm_wallet_service_1.EVMWalletService.transfer({
                privateKey,
                toAddress: recipient,
                amount,
                chainConfig,
                gasLimit,
                gasPrice,
            });
            // Record transaction in database
            const transactionRecord = await Transaction_model_1.Transaction.create({
                userId: user._id,
                type: 'withdraw',
                amount: amountNum,
                currency: chainConfig.symbol,
                status: 'completed',
                txHash: result.txHash,
                fromAddress: user.evmWalletAddress,
                toAddress: recipient,
                gasFee: result.gasPrice ? parseFloat(result.totalCost || '0') - amountNum : 0,
                totalAmount: parseFloat(result.totalCost || '0'),
                description: description || `${chainConfig.symbol} Transfer`,
                completedAt: new Date(),
                metadata: {
                    chain: chainConfig.name,
                    chainId: chainConfig.chainId,
                    blockNumber: result.blockNumber,
                    gasUsed: result.gasUsed,
                    gasPrice: result.gasPrice,
                },
            });
            // Clear balance cache
            // Clear cache if needed
            // await setCached(`evm:balance:${chain}:${user.evmWalletAddress}`, null, 0);
            logger_1.default.info('EVM transfer completed:', {
                userId: user._id,
                txHash: result.txHash,
                amount: amountNum,
                recipient,
                chain: chainConfig.name,
            });
            res.json({
                success: true,
                message: 'Transfer completed successfully',
                transaction: {
                    id: transactionRecord._id,
                    txHash: result.txHash,
                    amount: amountNum,
                    gasFee: transactionRecord.gasFee,
                    totalAmount: transactionRecord.totalAmount,
                    recipient,
                    status: 'completed',
                    blockNumber: result.blockNumber,
                    explorerUrl: result.explorerUrl,
                    chain: {
                        name: chainConfig.name,
                        chainId: chainConfig.chainId,
                        symbol: chainConfig.symbol,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('EVM transfer error:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: req.user?.id,
                body: req.body,
            });
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient balance for transfer',
                        code: constants_1.ERROR_CODES.INSUFFICIENT_BALANCE,
                    });
                }
                if (error.message.includes('nonce')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Transaction error. Please try again.',
                        code: constants_1.ERROR_CODES.INTERNAL_ERROR,
                    });
                }
            }
            next(error);
        }
    }
    /**
     * Import EVM wallet from private key
     */
    async importWallet(req, res, next) {
        try {
            const { privateKey, chain } = req.body;
            const userId = req.user.id;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Input validation
            if (!privateKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Private key is required',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Check if user already has an EVM wallet
            const user = await User_model_1.User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            if (user.evmWalletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'User already has an EVM wallet. Cannot import over existing wallet.',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Validate and import wallet
            if (!evm_wallet_service_1.EVMWalletService.isValidPrivateKey(privateKey)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid private key format',
                    code: constants_1.ERROR_CODES.INVALID_INPUT,
                });
            }
            const wallet = evm_wallet_service_1.EVMWalletService.importWallet(privateKey);
            // Encrypt and store private key
            const encryptedPrivateKey = (0, encryption_service_1.encryptPrivateKey)(wallet.privateKey);
            // Update user with wallet info
            user.evmWalletAddress = wallet.address;
            user.evmEncryptedPrivateKey = encryptedPrivateKey;
            await user.save();
            // Get wallet balance
            let balance = '0';
            try {
                const balanceInfo = await evm_wallet_service_1.EVMWalletService.getBalance(wallet.address, chainConfig);
                balance = balanceInfo.balance;
            }
            catch (balanceError) {
                logger_1.default.warn('Could not fetch balance for imported EVM wallet', { address: wallet.address });
            }
            logger_1.default.info('EVM wallet imported:', {
                userId: user._id,
                address: wallet.address,
                balance,
                chain: chainConfig.name,
            });
            res.json({
                success: true,
                message: 'EVM wallet imported successfully',
                wallet: {
                    address: wallet.address,
                    publicKey: wallet.publicKey,
                    balance,
                    symbol: chainConfig.symbol,
                    explorerUrl: `${chainConfig.explorerUrl}/address/${wallet.address}`,
                    chain: {
                        name: chainConfig.name,
                        chainId: chainConfig.chainId,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error('EVM wallet import error:', error);
            next(error);
        }
    }
    /**
     * Export EVM wallet (private key)
     */
    async exportWallet(req, res, next) {
        try {
            const userId = req.user.id;
            const { password } = req.body;
            // Input validation
            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is required for wallet export',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Get user with encrypted private key and password
            const user = await User_model_1.User.findById(userId).select('+evmEncryptedPrivateKey +password');
            if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
                return res.status(404).json({
                    success: false,
                    error: 'EVM wallet not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Verify user password for security
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid password',
                    code: constants_1.ERROR_CODES.AUTH_FAILED,
                });
            }
            // Decrypt private key
            const privateKey = (0, encryption_service_1.decryptPrivateKey)(user.evmEncryptedPrivateKey);
            const wallet = evm_wallet_service_1.EVMWalletService.importWallet(privateKey);
            // Log export event (for security audit)
            logger_1.default.warn('EVM wallet export requested:', {
                userId: user._id,
                address: user.evmWalletAddress,
                timestamp: new Date(),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Wallet exported successfully',
                wallet: {
                    address: wallet.address,
                    publicKey: wallet.publicKey,
                    privateKey: wallet.privateKey,
                },
                security: {
                    warning: 'Keep your private key secure. Never share it with anyone.',
                    recommendation: 'Store in a secure location and delete from device after saving.',
                },
            });
        }
        catch (error) {
            logger_1.default.error('EVM wallet export error:', error);
            next(error);
        }
    }
    /**
     * Get EVM wallet info
     */
    async getWalletInfo(req, res, next) {
        try {
            const userId = req.user.id;
            const { chain } = req.params;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Get user wallet
            const user = await User_model_1.User.findById(userId);
            if (!user || !user.evmWalletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'EVM wallet not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Get balance and network info in parallel
            const [balanceInfo, blockNumber, transactionCount] = await Promise.all([
                evm_wallet_service_1.EVMWalletService.getBalance(user.evmWalletAddress, chainConfig),
                evm_wallet_service_1.EVMWalletService.getBlockNumber(chainConfig),
                evm_wallet_service_1.EVMWalletService.getTransactionCount(user.evmWalletAddress, chainConfig),
            ]);
            // Get recent transaction count from database
            const recentTxCount = await Transaction_model_1.Transaction.countDocuments({
                $or: [
                    { fromAddress: user.evmWalletAddress },
                    { toAddress: user.evmWalletAddress },
                ],
                currency: chainConfig.symbol,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            });
            res.json({
                success: true,
                wallet: {
                    address: user.evmWalletAddress,
                    balance: balanceInfo.balance,
                    balanceInWei: balanceInfo.balanceInWei,
                    symbol: balanceInfo.symbol,
                    transactionCount,
                    recentTransactionCount: recentTxCount,
                    explorerUrl: `${chainConfig.explorerUrl}/address/${user.evmWalletAddress}`,
                },
                network: {
                    name: chainConfig.name,
                    chainId: chainConfig.chainId,
                    rpcUrl: chainConfig.rpcUrl,
                    currentBlock: blockNumber,
                    explorerUrl: chainConfig.explorerUrl,
                    isTestnet: chainConfig.isTestnet,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get EVM wallet info error:', error);
            next(error);
        }
    }
    /**
     * Get gas estimate for transfer
     */
    async estimateGas(req, res, next) {
        try {
            const { chain, recipient, amount } = req.body;
            const userId = req.user.id;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Input validation
            if (!recipient || !amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: recipient, amount',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            if (!evm_wallet_service_1.EVMWalletService.isValidAddress(recipient)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid recipient address',
                    code: constants_1.ERROR_CODES.INVALID_INPUT,
                });
            }
            // Get user wallet
            const user = await User_model_1.User.findById(userId);
            if (!user || !user.evmWalletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'EVM wallet not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            // Estimate gas
            const [gasEstimate, gasPrice] = await Promise.all([
                evm_wallet_service_1.EVMWalletService.estimateGas(user.evmWalletAddress, recipient, amount, chainConfig),
                evm_wallet_service_1.EVMWalletService.getGasPrice(chainConfig),
            ]);
            const estimatedGasFee = parseFloat((Number(gasEstimate) * Number(gasPrice) / 1e18).toFixed(8));
            res.json({
                success: true,
                gasEstimate: {
                    gasLimit: gasEstimate.toString(),
                    gasPrice: gasPrice.toString(),
                    estimatedGasFee,
                    symbol: chainConfig.symbol,
                    totalCost: parseFloat(amount) + estimatedGasFee,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Gas estimation error:', error);
            next(error);
        }
    }
    /**
     * Get transaction by hash
     */
    async getTransaction(req, res, next) {
        try {
            const { chain, txHash } = req.params;
            // Validate chain
            const chainConfig = (0, evm_config_1.getEVMChain)(chain);
            if (!chainConfig) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid chain specified',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            const [tx, receipt] = await Promise.all([
                evm_wallet_service_1.EVMWalletService.getTransaction(txHash, chainConfig),
                evm_wallet_service_1.EVMWalletService.getTransactionReceipt(txHash, chainConfig),
            ]);
            if (!tx) {
                return res.status(404).json({
                    success: false,
                    error: 'Transaction not found',
                    code: constants_1.ERROR_CODES.VALIDATION_ERROR,
                });
            }
            res.json({
                success: true,
                transaction: {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value.toString(),
                    gasLimit: tx.gasLimit.toString(),
                    gasPrice: tx.gasPrice?.toString(),
                    nonce: tx.nonce,
                    blockNumber: tx.blockNumber,
                    blockHash: tx.blockHash,
                    status: receipt?.status === 1 ? 'success' : receipt?.status === 0 ? 'failed' : 'pending',
                    gasUsed: receipt?.gasUsed.toString(),
                    explorerUrl: `${chainConfig.explorerUrl}/tx/${txHash}`,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get transaction error:', error);
            next(error);
        }
    }
}
exports.EVMWalletController = EVMWalletController;
exports.evmWalletController = new EVMWalletController();
//# sourceMappingURL=evm-wallet.controller.js.map