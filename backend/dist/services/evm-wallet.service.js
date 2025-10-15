"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMWalletService = void 0;
const ethers_1 = require("ethers");
const logger_1 = __importDefault(require("../utils/logger"));
class EVMWalletService {
    /**
     * Create a new EVM wallet
     */
    static createWallet() {
        const wallet = ethers_1.ethers.Wallet.createRandom();
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.signingKey.publicKey,
        };
    }
    /**
     * Import wallet from private key
     */
    static importWallet(privateKey) {
        try {
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: wallet.signingKey.publicKey,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to import EVM wallet:', error);
            throw new Error('Invalid private key format');
        }
    }
    /**
     * Get provider for a specific chain
     */
    static getProvider(chainConfig) {
        return new ethers_1.ethers.JsonRpcProvider(chainConfig.rpcUrl);
    }
    /**
     * Get wallet balance
     */
    static async getBalance(address, chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            const balanceInWei = await provider.getBalance(address);
            const balance = ethers_1.ethers.formatUnits(balanceInWei, chainConfig.decimals);
            return {
                balance,
                balanceInWei: balanceInWei.toString(),
                symbol: chainConfig.symbol,
                decimals: chainConfig.decimals,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to get EVM balance:', { address, chain: chainConfig.name, error });
            throw new Error('Failed to fetch balance');
        }
    }
    /**
     * Get wallet transaction count (nonce)
     */
    static async getTransactionCount(address, chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            return await provider.getTransactionCount(address);
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction count:', { address, chain: chainConfig.name, error });
            throw new Error('Failed to fetch transaction count');
        }
    }
    /**
     * Estimate gas for a transaction
     */
    static async estimateGas(fromAddress, toAddress, amount, chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            const amountInWei = ethers_1.ethers.parseUnits(amount, chainConfig.decimals);
            const gasEstimate = await provider.estimateGas({
                from: fromAddress,
                to: toAddress,
                value: amountInWei,
            });
            return gasEstimate;
        }
        catch (error) {
            logger_1.default.error('Failed to estimate gas:', { fromAddress, toAddress, amount, error });
            throw new Error('Failed to estimate gas');
        }
    }
    /**
     * Get current gas price
     */
    static async getGasPrice(chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            const feeData = await provider.getFeeData();
            return feeData.gasPrice || BigInt(0);
        }
        catch (error) {
            logger_1.default.error('Failed to get gas price:', { chain: chainConfig.name, error });
            throw new Error('Failed to fetch gas price');
        }
    }
    /**
     * Transfer native token (ETH, MATIC, BNB, etc.)
     */
    static async transfer(params) {
        try {
            const { privateKey, toAddress, amount, chainConfig, gasLimit, gasPrice } = params;
            const provider = this.getProvider(chainConfig);
            const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
            // Convert amount to Wei
            const amountInWei = ethers_1.ethers.parseUnits(amount, chainConfig.decimals);
            // Prepare transaction
            const txRequest = {
                to: toAddress,
                value: amountInWei,
            };
            // Set gas limit if provided
            if (gasLimit) {
                txRequest.gasLimit = BigInt(gasLimit);
            }
            // Set gas price if provided
            if (gasPrice) {
                txRequest.gasPrice = BigInt(gasPrice);
            }
            logger_1.default.info('Sending EVM transaction:', {
                from: wallet.address,
                to: toAddress,
                amount,
                chain: chainConfig.name,
            });
            // Send transaction
            const tx = await wallet.sendTransaction(txRequest);
            logger_1.default.info('Transaction sent, waiting for confirmation:', {
                txHash: tx.hash,
                chain: chainConfig.name,
            });
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error('Transaction receipt not found');
            }
            const gasUsed = receipt.gasUsed.toString();
            const effectiveGasPrice = receipt.gasPrice.toString();
            const totalGasCost = receipt.gasUsed * receipt.gasPrice;
            const totalCost = ethers_1.ethers.formatUnits(amountInWei + totalGasCost, chainConfig.decimals);
            logger_1.default.info('Transaction confirmed:', {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed,
                chain: chainConfig.name,
            });
            return {
                txHash: receipt.hash,
                from: receipt.from,
                to: receipt.to || toAddress,
                amount,
                gasUsed,
                gasPrice: effectiveGasPrice,
                totalCost,
                blockNumber: receipt.blockNumber,
                explorerUrl: `${chainConfig.explorerUrl}/tx/${receipt.hash}`,
            };
        }
        catch (error) {
            logger_1.default.error('EVM transfer failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                params,
            });
            if (error instanceof Error) {
                if (error.message.includes('insufficient funds')) {
                    throw new Error('Insufficient balance for transfer');
                }
                if (error.message.includes('nonce')) {
                    throw new Error('Transaction nonce error. Please try again.');
                }
                if (error.message.includes('gas')) {
                    throw new Error('Gas estimation failed. Please adjust gas parameters.');
                }
            }
            throw new Error('Transfer failed');
        }
    }
    /**
     * Get transaction by hash
     */
    static async getTransaction(txHash, chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            return await provider.getTransaction(txHash);
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction:', { txHash, chain: chainConfig.name, error });
            return null;
        }
    }
    /**
     * Get transaction receipt
     */
    static async getTransactionReceipt(txHash, chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            return await provider.getTransactionReceipt(txHash);
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction receipt:', { txHash, chain: chainConfig.name, error });
            return null;
        }
    }
    /**
     * Validate EVM address
     */
    static isValidAddress(address) {
        return ethers_1.ethers.isAddress(address);
    }
    /**
     * Validate private key
     */
    static isValidPrivateKey(privateKey) {
        try {
            new ethers_1.ethers.Wallet(privateKey);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get current block number
     */
    static async getBlockNumber(chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            return await provider.getBlockNumber();
        }
        catch (error) {
            logger_1.default.error('Failed to get block number:', { chain: chainConfig.name, error });
            throw new Error('Failed to fetch block number');
        }
    }
    /**
     * Get network information
     */
    static async getNetwork(chainConfig) {
        try {
            const provider = this.getProvider(chainConfig);
            return await provider.getNetwork();
        }
        catch (error) {
            logger_1.default.error('Failed to get network info:', { chain: chainConfig.name, error });
            throw new Error('Failed to fetch network information');
        }
    }
}
exports.EVMWalletService = EVMWalletService;
//# sourceMappingURL=evm-wallet.service.js.map