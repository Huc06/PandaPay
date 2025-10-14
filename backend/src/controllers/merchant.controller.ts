import { Request, Response, NextFunction } from 'express';
import { Merchant } from '../models/Merchant.model';
import logger from '../utils/logger';

export class MerchantController {
  async getPublicMerchantInfo(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async registerMerchant(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getMerchantProfile(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Find merchant record by email
      const merchant = await Merchant.findOne({ email: user.email })
        .select('+apiKeys.secretKey +apiKeys.webhookSecret');

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: 'Merchant profile not found. Please complete merchant registration.'
        });
      }

      return res.json({
        success: true,
        id: merchant._id,
        merchantId: merchant.merchantId,
        merchantName: merchant.merchantName,
        businessType: merchant.businessType,
        email: merchant.email,
        phoneNumber: merchant.phoneNumber,
        walletAddress: merchant.evmWalletAddress || merchant.walletAddress,
        address: merchant.address,
        apiKeys: {
          publicKey: merchant.apiKeys.publicKey,
          secretKey: merchant.apiKeys.secretKey,
        },
        webhookUrl: merchant.webhookUrl,
        isActive: merchant.isActive,
        isVerified: merchant.isVerified,
        commission: merchant.commission,
        settlementPeriod: merchant.settlementPeriod,
        totalTransactions: merchant.totalTransactions,
        totalVolume: merchant.totalVolume
      });
    } catch (error) {
      logger.error('Get merchant profile error:', error);
      next(error);
    }
  }

  async updateMerchantProfile(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getMerchantPayments(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getMerchantPaymentStats(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async refundPayment(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getMerchantSettings(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async updateMerchantSettings(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getWebhooks(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async createWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async updateWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async deleteWebhook(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getApiKeys(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async createApiKey(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async deleteApiKey(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async getAllMerchants(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async updateMerchantStatus(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }

  async updateMerchantLimits(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      res.json({ success: true, message: 'Merchant controller method not implemented yet' });
    } catch (error) { next(error); }
  }
}

export const merchantController = new MerchantController();