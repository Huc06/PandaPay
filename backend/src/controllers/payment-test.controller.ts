import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { socketService } from '../services/socket.service';

export class PaymentTestController {
  /**
   * Create merchant payment request (for QR code generation)
   * This is a test endpoint that doesn't require authentication
   */
  async createMerchantRequest(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required',
        });
      }

      // Generate unique request ID
      const requestId = `REQ_${Date.now()}_${uuidv4().slice(0, 8)}`;

      // Generate test merchant ID (in real app, get from authenticated user)
      const merchantId = `MCH_TEST_${uuidv4().slice(0, 8)}`;

      // Get merchant address from environment or use test address
      const merchantAddress = process.env.TEST_MERCHANT_ADDRESS || '0xe92bfd25182a0562f126a364881502761c7d20739585234288728f449fc51bda';

      // Create QR payload
      const qrPayload = {
        requestId,
        amount: parseFloat(amount).toString(), // Convert to string for consistency
        merchantAddress, // Required U2U wallet address
        merchantId, // Legacy field for backwards compatibility
        currency: 'U2U',
        paymentMethod: 'QR' as const,
        description: description || undefined,
      };

      // Create merchant request object
      const merchantRequest = {
        id: requestId,
        amount: parseFloat(amount),
        status: 'pending',
        qrPayload,
        createdAt: new Date().toISOString(),
      };

      logger.info(`Created merchant payment request: ${requestId}`);

      // Emit socket event for QR status
      socketService.emitQRStatusUpdate(requestId, {
        status: 'created',
        timestamp: new Date().toISOString(),
        amount: parseFloat(amount),
        merchantId,
      });

      return res.json({
        success: true,
        request: merchantRequest,
      });
    } catch (error) {
      logger.error('Create merchant request error:', error);
      next(error);
    }
  }

  /**
   * Get merchant request by ID
   */
  async getMerchantRequest(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { requestId } = req.params;

      // In a real app, fetch from database
      // For now, return mock data
      return res.json({
        success: true,
        request: {
          id: requestId,
          status: 'pending',
          amount: 0,
        },
      });
    } catch (error) {
      logger.error('Get merchant request error:', error);
      next(error);
    }
  }

  /**
   * Update merchant request status (simulated payment completion)
   */
  async updateMerchantRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { requestId } = req.params;
      const { status, txHash } = req.body;

      logger.info(`Updating merchant request ${requestId} to status: ${status}`);

      // Emit socket event
      socketService.emitQRStatusUpdate(requestId, {
        status,
        timestamp: new Date().toISOString(),
        txHash,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      });

      return res.json({
        success: true,
        message: 'Status updated',
      });
    } catch (error) {
      logger.error('Update merchant request status error:', error);
      next(error);
    }
  }
}

export const paymentTestController = new PaymentTestController();
