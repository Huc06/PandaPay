import { Router } from 'express';
import { evmWalletController } from '../controllers/evm-wallet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body, param, query, validationResult } from 'express-validator';

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

const router: ReturnType<typeof Router> = Router();

/**
 * @route   GET /api/evm-wallet/chains
 * @desc    Get all available EVM chains
 * @access  Public
 */
router.get(
  '/chains',
  [
    query('type')
      .optional()
      .isIn(['testnet', 'mainnet'])
      .withMessage('Type must be testnet or mainnet'),
    validateRequest,
  ],
  evmWalletController.getChains.bind(evmWalletController)
);

/**
 * @route   POST /api/evm-wallet/create
 * @desc    Create a new EVM wallet for user
 * @access  Private
 */
router.post(
  '/create',
  authenticate,
  [
    body('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
  ],
  validateRequest,
  evmWalletController.createWallet.bind(evmWalletController)
);

/**
 * @route   POST /api/evm-wallet/import
 * @desc    Import EVM wallet from private key
 * @access  Private
 */
router.post(
  '/import',
  authenticate,
  [
    body('privateKey')
      .notEmpty()
      .withMessage('Private key is required')
      .isString()
      .withMessage('Private key must be a string'),
    body('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
  ],
  validateRequest,
  evmWalletController.importWallet.bind(evmWalletController)
);

/**
 * @route   POST /api/evm-wallet/export
 * @desc    Export EVM wallet (get private key)
 * @access  Private
 */
router.post(
  '/export',
  authenticate,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required for wallet export'),
  ],
  validateRequest,
  evmWalletController.exportWallet.bind(evmWalletController)
);

/**
 * @route   GET /api/evm-wallet/balance/:chain/:address
 * @desc    Get EVM wallet balance
 * @access  Public
 */
router.get(
  '/balance/:chain/:address',
  [
    param('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
    param('address')
      .notEmpty()
      .withMessage('Address is required')
      .isString()
      .withMessage('Address must be a string'),
    validateRequest,
  ],
  evmWalletController.getBalance.bind(evmWalletController)
);

/**
 * @route   GET /api/evm-wallet/info/:chain
 * @desc    Get user's EVM wallet info for specific chain
 * @access  Private
 */
router.get(
  '/info/:chain',
  authenticate,
  [
    param('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
  ],
  validateRequest,
  evmWalletController.getWalletInfo.bind(evmWalletController)
);

/**
 * @route   POST /api/evm-wallet/transfer
 * @desc    Transfer native token (ETH, MATIC, BNB, etc.)
 * @access  Private
 */
router.post(
  '/transfer',
  authenticate,
  [
    body('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
    body('recipient')
      .notEmpty()
      .withMessage('Recipient address is required')
      .isString()
      .withMessage('Recipient must be a string'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isString()
      .withMessage('Amount must be a string'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('gasLimit')
      .optional()
      .isString()
      .withMessage('Gas limit must be a string'),
    body('gasPrice')
      .optional()
      .isString()
      .withMessage('Gas price must be a string'),
  ],
  validateRequest,
  evmWalletController.transfer.bind(evmWalletController)
);

/**
 * @route   POST /api/evm-wallet/estimate-gas
 * @desc    Estimate gas for transfer
 * @access  Private
 */
router.post(
  '/estimate-gas',
  authenticate,
  [
    body('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
    body('recipient')
      .notEmpty()
      .withMessage('Recipient address is required')
      .isString()
      .withMessage('Recipient must be a string'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isString()
      .withMessage('Amount must be a string'),
  ],
  validateRequest,
  evmWalletController.estimateGas.bind(evmWalletController)
);

/**
 * @route   GET /api/evm-wallet/transaction/:chain/:txHash
 * @desc    Get transaction details by hash
 * @access  Public
 */
router.get(
  '/transaction/:chain/:txHash',
  [
    param('chain')
      .notEmpty()
      .withMessage('Chain is required')
      .isString()
      .withMessage('Chain must be a string'),
    param('txHash')
      .notEmpty()
      .withMessage('Transaction hash is required')
      .isString()
      .withMessage('Transaction hash must be a string'),
    validateRequest,
  ],
  evmWalletController.getTransaction.bind(evmWalletController)
);

export default router;
