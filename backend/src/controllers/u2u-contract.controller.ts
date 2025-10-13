import { Request, Response } from 'express';
import { U2UContractService } from '../services/u2u-contract.service';
import logger from '../utils/logger';

export class U2UContractController {
  /**
   * Register a new merchant
   * POST /api/u2u-contract/merchant/register
   */
  static async registerMerchant(req: Request, res: Response): Promise<any> {
    try {
      const { businessName, privateKey } = req.body;

      if (!businessName || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Business name and private key are required',
        });
      }

      const result = await U2UContractService.registerMerchant({
        businessName,
        privateKey,
      });

      return res.json({
        success: true,
        data: result,
        message: 'Merchant registered successfully',
      });
    } catch (error) {
      logger.error('Register merchant error:', error);
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
  static async createPayment(req: Request, res: Response): Promise<any> {
    try {
      const { merchantAddress, amount, paymentMethod, privateKey } = req.body;

      if (!merchantAddress || !amount || !paymentMethod || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Merchant address, amount, payment method, and private key are required',
        });
      }

      const result = await U2UContractService.createPayment({
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
    } catch (error) {
      logger.error('Create payment error:', error);
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
  static async confirmPayment(req: Request, res: Response): Promise<any> {
    try {
      const { transactionId, privateKey } = req.body;

      if (transactionId === undefined || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID and private key are required',
        });
      }

      const result = await U2UContractService.confirmPayment({
        transactionId: Number(transactionId),
        privateKey,
      });

      return res.json({
        success: true,
        data: result,
        message: 'Payment confirmed successfully',
      });
    } catch (error) {
      logger.error('Confirm payment error:', error);
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
  static async refundPayment(req: Request, res: Response): Promise<any> {
    try {
      const { transactionId, privateKey } = req.body;

      if (transactionId === undefined || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID and private key are required',
        });
      }

      const result = await U2UContractService.refundPayment({
        transactionId: Number(transactionId),
        privateKey,
      });

      return res.json({
        success: true,
        data: result,
        message: 'Payment refunded successfully',
      });
    } catch (error) {
      logger.error('Refund payment error:', error);
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
  static async getMerchantInfo(req: Request, res: Response): Promise<any> {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Merchant address is required',
        });
      }

      const merchantInfo = await U2UContractService.getMerchantInfo(address);

      // Format the revenue for display
      const formattedRevenue = U2UContractService.formatAmount(merchantInfo.totalRevenue);

      return res.json({
        success: true,
        data: {
          ...merchantInfo,
          totalRevenueFormatted: `${formattedRevenue} U2U`,
        },
      });
    } catch (error) {
      logger.error('Get merchant info error:', error);
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
  static async getTransactionDetails(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required',
        });
      }

      const transaction = await U2UContractService.getTransactionDetails(Number(id));

      // Format the amount for display
      const formattedAmount = U2UContractService.formatAmount(transaction.amount);

      return res.json({
        success: true,
        data: {
          ...transaction,
          amountFormatted: `${formattedAmount} U2U`,
        },
      });
    } catch (error) {
      logger.error('Get transaction details error:', error);
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
  static async getMerchantTransactions(req: Request, res: Response): Promise<any> {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Merchant address is required',
        });
      }

      const transactionIds = await U2UContractService.getMerchantTransactions(address);

      return res.json({
        success: true,
        data: {
          merchantAddress: address,
          transactionIds,
          count: transactionIds.length,
        },
      });
    } catch (error) {
      logger.error('Get merchant transactions error:', error);
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
  static async getUserTransactions(req: Request, res: Response): Promise<any> {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'User address is required',
        });
      }

      const transactionIds = await U2UContractService.getUserTransactions(address);

      return res.json({
        success: true,
        data: {
          userAddress: address,
          transactionIds,
          count: transactionIds.length,
        },
      });
    } catch (error) {
      logger.error('Get user transactions error:', error);
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
  static async getPlatformStats(_req: Request, res: Response): Promise<any> {
    try {
      const feePercent = await U2UContractService.getPlatformFeePercent();
      const transactionCounter = await U2UContractService.getTransactionCounter();
      const contractAddress = U2UContractService.getContractAddress();
      const chainConfig = U2UContractService.getChainConfig();

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
    } catch (error) {
      logger.error('Get platform stats error:', error);
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
  static async deactivateMerchant(req: Request, res: Response): Promise<any> {
    try {
      const { address } = req.params;
      const { ownerPrivateKey } = req.body;

      if (!address || !ownerPrivateKey) {
        return res.status(400).json({
          success: false,
          error: 'Merchant address and owner private key are required',
        });
      }

      const result = await U2UContractService.deactivateMerchant(address, ownerPrivateKey);

      return res.json({
        success: true,
        data: result,
        message: 'Merchant deactivated successfully',
      });
    } catch (error) {
      logger.error('Deactivate merchant error:', error);
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
  static async updatePlatformFee(req: Request, res: Response): Promise<any> {
    try {
      const { newFeePercent, ownerPrivateKey } = req.body;

      if (newFeePercent === undefined || !ownerPrivateKey) {
        return res.status(400).json({
          success: false,
          error: 'New fee percent and owner private key are required',
        });
      }

      const result = await U2UContractService.updatePlatformFee(
        Number(newFeePercent),
        ownerPrivateKey
      );

      return res.json({
        success: true,
        data: result,
        message: 'Platform fee updated successfully',
      });
    } catch (error) {
      logger.error('Update platform fee error:', error);
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
  static async getContractInfo(_req: Request, res: Response): Promise<any> {
    try {
      const contractAddress = U2UContractService.getContractAddress();
      const chainConfig = U2UContractService.getChainConfig();

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
    } catch (error) {
      logger.error('Get contract info error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get contract information',
      });
    }
  }
}
