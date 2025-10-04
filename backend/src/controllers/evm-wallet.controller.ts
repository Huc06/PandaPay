import { Request, Response, NextFunction } from 'express';
import { EVMWalletService } from '../services/evm-wallet.service';
import { getEVMChain, getAllEVMChains, getTestnetChains, getMainnetChains } from '../config/evm.config';
import { User } from '../models/User.model';
import { Transaction as TransactionModel } from '../models/Transaction.model';
import { encryptPrivateKey, decryptPrivateKey } from '../services/encryption.service';
import { ERROR_CODES } from '../config/constants';
import logger from '../utils/logger';

export class EVMWalletController {
  /**
   * Get all available EVM chains
   */
  async getChains(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { type } = req.query;

      let chains;
      if (type === 'testnet') {
        chains = getTestnetChains();
      } else if (type === 'mainnet') {
        chains = getMainnetChains();
      } else {
        chains = getAllEVMChains();
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new EVM wallet for user
   */
  async createWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId = (req as any).user.id;
      const { chain } = req.body;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Check if user already has an EVM wallet
      const user = await User.findById(userId);
      if (user?.evmWalletAddress) {
        return res.status(400).json({
          success: false,
          error: 'User already has an EVM wallet',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Create new wallet
      const wallet = EVMWalletService.createWallet();

      // Encrypt and store private key
      const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey!);

      // Update user with wallet info
      user!.evmWalletAddress = wallet.address;
      user!.evmEncryptedPrivateKey = encryptedPrivateKey;
      await user!.save();

      logger.info('EVM wallet created:', {
        userId: user!._id,
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
    } catch (error) {
      logger.error('EVM wallet creation error:', error);
      next(error);
    }
  }

  /**
   * Get EVM wallet balance
   */
  async getBalance(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { address, chain } = req.params;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Validate address
      if (!EVMWalletService.isValidAddress(address)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid EVM address',
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      // Get balance
      const balanceInfo = await EVMWalletService.getBalance(address, chainConfig);

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
    } catch (error) {
      logger.error('Get balance error:', error);
      next(error);
    }
  }

  /**
   * Transfer native token (ETH, MATIC, BNB, etc.)
   */
  async transfer(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { chain, recipient, amount, description, gasLimit, gasPrice } = req.body;
      const userId = (req as any).user.id;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Input validation
      if (!recipient || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: recipient, amount',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      if (!EVMWalletService.isValidAddress(recipient)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipient address',
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount',
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      // Get user with encrypted private key
      const user = await User.findById(userId).select('+evmEncryptedPrivateKey');
      if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
        return res.status(400).json({
          success: false,
          error: 'EVM wallet not found',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Check wallet balance
      const balanceInfo = await EVMWalletService.getBalance(user.evmWalletAddress, chainConfig);
      const walletBalance = parseFloat(balanceInfo.balance);

      // Estimate gas
      let estimatedGas: bigint;
      let currentGasPrice: bigint;
      try {
        estimatedGas = await EVMWalletService.estimateGas(
          user.evmWalletAddress,
          recipient,
          amount,
          chainConfig
        );
        currentGasPrice = await EVMWalletService.getGasPrice(chainConfig);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Failed to estimate gas. Please check your balance and try again.',
          code: ERROR_CODES.INTERNAL_ERROR,
        });
      }

      const estimatedGasFee = parseFloat(
        (Number(estimatedGas) * Number(currentGasPrice) / 1e18).toFixed(8)
      );
      const totalRequired = amountNum + estimatedGasFee;

      if (walletBalance < totalRequired) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient balance',
          code: ERROR_CODES.INSUFFICIENT_BALANCE,
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
      const privateKey = decryptPrivateKey(user.evmEncryptedPrivateKey);

      // Execute transfer
      const result = await EVMWalletService.transfer({
        privateKey,
        toAddress: recipient,
        amount,
        chainConfig,
        gasLimit,
        gasPrice,
      });

      // Record transaction in database
      const transactionRecord = await TransactionModel.create({
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

      logger.info('EVM transfer completed:', {
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
    } catch (error) {
      logger.error('EVM transfer error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
        body: req.body,
      });

      if (error instanceof Error) {
        if (error.message.includes('Insufficient balance')) {
          return res.status(400).json({
            success: false,
            error: 'Insufficient balance for transfer',
            code: ERROR_CODES.INSUFFICIENT_BALANCE,
          });
        }
        if (error.message.includes('nonce')) {
          return res.status(400).json({
            success: false,
            error: 'Transaction error. Please try again.',
            code: ERROR_CODES.INTERNAL_ERROR,
          });
        }
      }

      next(error);
    }
  }

  /**
   * Import EVM wallet from private key
   */
  async importWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { privateKey, chain } = req.body;
      const userId = (req as any).user.id;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Input validation
      if (!privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Private key is required',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Check if user already has an EVM wallet
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      if (user.evmWalletAddress) {
        return res.status(400).json({
          success: false,
          error: 'User already has an EVM wallet. Cannot import over existing wallet.',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Validate and import wallet
      if (!EVMWalletService.isValidPrivateKey(privateKey)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid private key format',
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      const wallet = EVMWalletService.importWallet(privateKey);

      // Encrypt and store private key
      const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey!);

      // Update user with wallet info
      user.evmWalletAddress = wallet.address;
      user.evmEncryptedPrivateKey = encryptedPrivateKey;
      await user.save();

      // Get wallet balance
      let balance = '0';
      try {
        const balanceInfo = await EVMWalletService.getBalance(wallet.address, chainConfig);
        balance = balanceInfo.balance;
      } catch (balanceError) {
        logger.warn('Could not fetch balance for imported EVM wallet', { address: wallet.address });
      }

      logger.info('EVM wallet imported:', {
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
    } catch (error) {
      logger.error('EVM wallet import error:', error);
      next(error);
    }
  }

  /**
   * Export EVM wallet (private key)
   */
  async exportWallet(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId = (req as any).user.id;
      const { password } = req.body;

      // Input validation
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required for wallet export',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Get user with encrypted private key and password
      const user = await User.findById(userId).select('+evmEncryptedPrivateKey +password');
      if (!user || !user.evmWalletAddress || !user.evmEncryptedPrivateKey) {
        return res.status(404).json({
          success: false,
          error: 'EVM wallet not found',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Verify user password for security
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password',
          code: ERROR_CODES.AUTH_FAILED,
        });
      }

      // Decrypt private key
      const privateKey = decryptPrivateKey(user.evmEncryptedPrivateKey);
      const wallet = EVMWalletService.importWallet(privateKey);

      // Log export event (for security audit)
      logger.warn('EVM wallet export requested:', {
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
    } catch (error) {
      logger.error('EVM wallet export error:', error);
      next(error);
    }
  }

  /**
   * Get EVM wallet info
   */
  async getWalletInfo(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId = (req as any).user.id;
      const { chain } = req.params;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Get user wallet
      const user = await User.findById(userId);
      if (!user || !user.evmWalletAddress) {
        return res.status(400).json({
          success: false,
          error: 'EVM wallet not found',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Get balance and network info in parallel
      const [balanceInfo, blockNumber, transactionCount] = await Promise.all([
        EVMWalletService.getBalance(user.evmWalletAddress, chainConfig),
        EVMWalletService.getBlockNumber(chainConfig),
        EVMWalletService.getTransactionCount(user.evmWalletAddress, chainConfig),
      ]);

      // Get recent transaction count from database
      const recentTxCount = await TransactionModel.countDocuments({
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
    } catch (error) {
      logger.error('Get EVM wallet info error:', error);
      next(error);
    }
  }

  /**
   * Get gas estimate for transfer
   */
  async estimateGas(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { chain, recipient, amount } = req.body;
      const userId = (req as any).user.id;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Input validation
      if (!recipient || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: recipient, amount',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      if (!EVMWalletService.isValidAddress(recipient)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid recipient address',
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      // Get user wallet
      const user = await User.findById(userId);
      if (!user || !user.evmWalletAddress) {
        return res.status(400).json({
          success: false,
          error: 'EVM wallet not found',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      // Estimate gas
      const [gasEstimate, gasPrice] = await Promise.all([
        EVMWalletService.estimateGas(user.evmWalletAddress, recipient, amount, chainConfig),
        EVMWalletService.getGasPrice(chainConfig),
      ]);

      const estimatedGasFee = parseFloat(
        (Number(gasEstimate) * Number(gasPrice) / 1e18).toFixed(8)
      );

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
    } catch (error) {
      logger.error('Gas estimation error:', error);
      next(error);
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { chain, txHash } = req.params;

      // Validate chain
      const chainConfig = getEVMChain(chain);
      if (!chainConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid chain specified',
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }

      const [tx, receipt] = await Promise.all([
        EVMWalletService.getTransaction(txHash, chainConfig),
        EVMWalletService.getTransactionReceipt(txHash, chainConfig),
      ]);

      if (!tx) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
          code: ERROR_CODES.VALIDATION_ERROR,
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
    } catch (error) {
      logger.error('Get transaction error:', error);
      next(error);
    }
  }
}

export const evmWalletController = new EVMWalletController();
