import { Router } from 'express';
import { U2UContractController } from '../controllers/u2u-contract.controller';
import { validate } from '../middleware/validation.middleware';
import { u2uContractValidators } from '../validators/u2u-contract.validator';

const router = Router();

// Public endpoints
// Get contract information
router.get('/info', U2UContractController.getContractInfo);

// Get platform statistics
router.get('/stats', U2UContractController.getPlatformStats);

// Merchant endpoints
router.post(
  '/merchant/register',
  validate(u2uContractValidators.registerMerchant),
  U2UContractController.registerMerchant
);

router.get(
  '/merchant/:address',
  validate(u2uContractValidators.getMerchantInfo),
  U2UContractController.getMerchantInfo
);

router.get(
  '/merchant/:address/transactions',
  validate(u2uContractValidators.getMerchantTransactions),
  U2UContractController.getMerchantTransactions
);

// Admin-only: Deactivate merchant
router.post(
  '/merchant/:address/deactivate',
  validate(u2uContractValidators.deactivateMerchant),
  U2UContractController.deactivateMerchant
);

// Payment endpoints
router.post(
  '/payment/create',
  validate(u2uContractValidators.createPayment),
  U2UContractController.createPayment
);

router.post(
  '/payment/confirm',
  validate(u2uContractValidators.confirmPayment),
  U2UContractController.confirmPayment
);

router.post(
  '/payment/refund',
  validate(u2uContractValidators.refundPayment),
  U2UContractController.refundPayment
);

// Transaction endpoints
router.get(
  '/transaction/:id',
  validate(u2uContractValidators.getTransactionDetails),
  U2UContractController.getTransactionDetails
);

// User endpoints
router.get(
  '/user/:address/transactions',
  validate(u2uContractValidators.getUserTransactions),
  U2UContractController.getUserTransactions
);

// Platform management (admin only)
router.post(
  '/platform/fee',
  validate(u2uContractValidators.updatePlatformFee),
  U2UContractController.updatePlatformFee
);

export default router;
