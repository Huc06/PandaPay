import { Router } from 'express';
import { paymentTestController } from '../controllers/payment-test.controller';
import { body, validationResult } from 'express-validator';

const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  return next();
};

const router = Router();

/**
 * @route   POST /api/payment/test/merchant-request
 * @desc    Create merchant payment request (for QR code generation)
 * @access  Public (Test endpoint)
 */
router.post(
  '/merchant-request',
  [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom((value) => parseFloat(value) > 0)
      .withMessage('Amount must be greater than 0'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    validateRequest,
  ],
  paymentTestController.createMerchantRequest.bind(paymentTestController)
);

/**
 * @route   GET /api/payment/test/merchant-request/:requestId
 * @desc    Get merchant request by ID
 * @access  Public (Test endpoint)
 */
router.get(
  '/merchant-request/:requestId',
  paymentTestController.getMerchantRequest.bind(paymentTestController)
);

/**
 * @route   PUT /api/payment/test/merchant-request/:requestId/status
 * @desc    Update merchant request status (simulated payment)
 * @access  Public (Test endpoint)
 */
router.put(
  '/merchant-request/:requestId/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['scanned', 'processing', 'completed', 'failed'])
      .withMessage('Invalid status'),
    body('txHash')
      .optional()
      .isString()
      .withMessage('Transaction hash must be a string'),
    validateRequest,
  ],
  paymentTestController.updateMerchantRequestStatus.bind(paymentTestController)
);

export default router;
