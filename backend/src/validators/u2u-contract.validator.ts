import { body, param } from 'express-validator';

export const u2uContractValidators = {
  registerMerchant: [
    body('businessName')
      .trim()
      .notEmpty()
      .withMessage('Business name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Business name must be between 3 and 100 characters'),
    body('privateKey')
      .trim()
      .notEmpty()
      .withMessage('Private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],

  createPayment: [
    body('merchantAddress')
      .trim()
      .notEmpty()
      .withMessage('Merchant address is required')
      .matches(/^0x[0-9a-fA-F]{40}$/)
      .withMessage('Invalid merchant address format'),
    body('amount')
      .trim()
      .notEmpty()
      .withMessage('Amount is required')
      .isDecimal()
      .withMessage('Amount must be a valid number')
      .custom((value) => {
        const num = parseFloat(value);
        if (num <= 0) {
          throw new Error('Amount must be greater than 0');
        }
        return true;
      }),
    body('paymentMethod')
      .trim()
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['POS', 'QR'])
      .withMessage('Payment method must be POS or QR'),
    body('privateKey')
      .trim()
      .notEmpty()
      .withMessage('Private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],

  confirmPayment: [
    body('transactionId')
      .notEmpty()
      .withMessage('Transaction ID is required')
      .isInt({ min: 0 })
      .withMessage('Transaction ID must be a positive integer'),
    body('privateKey')
      .trim()
      .notEmpty()
      .withMessage('Private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],

  refundPayment: [
    body('transactionId')
      .notEmpty()
      .withMessage('Transaction ID is required')
      .isInt({ min: 0 })
      .withMessage('Transaction ID must be a positive integer'),
    body('privateKey')
      .trim()
      .notEmpty()
      .withMessage('Private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],

  getMerchantInfo: [
    param('address')
      .trim()
      .notEmpty()
      .withMessage('Merchant address is required')
      .matches(/^0x[0-9a-fA-F]{40}$/)
      .withMessage('Invalid merchant address format'),
  ],

  getTransactionDetails: [
    param('id')
      .notEmpty()
      .withMessage('Transaction ID is required')
      .isInt({ min: 0 })
      .withMessage('Transaction ID must be a positive integer'),
  ],

  getMerchantTransactions: [
    param('address')
      .trim()
      .notEmpty()
      .withMessage('Merchant address is required')
      .matches(/^0x[0-9a-fA-F]{40}$/)
      .withMessage('Invalid merchant address format'),
  ],

  getUserTransactions: [
    param('address')
      .trim()
      .notEmpty()
      .withMessage('User address is required')
      .matches(/^0x[0-9a-fA-F]{40}$/)
      .withMessage('Invalid user address format'),
  ],

  deactivateMerchant: [
    param('address')
      .trim()
      .notEmpty()
      .withMessage('Merchant address is required')
      .matches(/^0x[0-9a-fA-F]{40}$/)
      .withMessage('Invalid merchant address format'),
    body('ownerPrivateKey')
      .trim()
      .notEmpty()
      .withMessage('Owner private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],

  updatePlatformFee: [
    body('newFeePercent')
      .notEmpty()
      .withMessage('New fee percent is required')
      .isInt({ min: 0, max: 100 })
      .withMessage('Fee percent must be between 0 and 100'),
    body('ownerPrivateKey')
      .trim()
      .notEmpty()
      .withMessage('Owner private key is required')
      .matches(/^0x[0-9a-fA-F]{64}$/)
      .withMessage('Invalid private key format'),
  ],
};
