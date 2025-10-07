import { PaymentService } from '../payment.service';
import { EVMWalletService } from '../evm-wallet.service';
import { User } from '../../models/User.model';
import { Card } from '../../models/Card.model';
import { Transaction } from '../../models/Transaction.model';
import { Merchant } from '../../models/Merchant.model';
import { decryptPrivateKey } from '../encryption.service';
import { getEVMChain, DEFAULT_EVM_CHAIN } from '../../config/evm.config';

// Mock dependencies
jest.mock('../evm-wallet.service');
jest.mock('../../models/User.model');
jest.mock('../../models/Card.model');
jest.mock('../../models/Transaction.model');
jest.mock('../../models/Merchant.model');
jest.mock('../encryption.service');
jest.mock('../../config/evm.config');
jest.mock('../../config/redis.config', () => ({
  getCached: jest.fn(),
  setCached: jest.fn(),
}));

describe('PaymentService - EVM Wallet Integration', () => {
  let paymentService: PaymentService;

  // Mock data
  const mockCardUuid = 'test-card-uuid-123';
  const mockAmount = 10;
  const mockMerchantId = 'merchant-123';
  const mockChainKey = 'u2u-nebulas';

  const mockUser = {
    _id: 'user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    evmWalletAddress: '0x1234567890123456789012345678901234567890',
    evmEncryptedPrivateKey: 'encrypted-key',
    dailyLimit: 1000,
    monthlyLimit: 10000,
  };

  const mockCard = {
    _id: 'card-123',
    cardUuid: mockCardUuid,
    userId: 'user-123',
    cardType: 'virtual',
    isActive: true,
    isExpired: false,
    blockedAt: null,
    dailySpent: 0,
    monthlySpent: 0,
    usageCount: 0,
    lastResetDate: new Date(),
    lastUsed: null,
    save: jest.fn(),
  };

  const mockMerchant = {
    _id: 'merchant-123',
    merchantId: mockMerchantId,
    merchantName: 'Test Merchant',
    evmWalletAddress: '0x9876543210987654321098765432109876543210',
    isActive: true,
    totalTransactions: 0,
    totalVolume: 0,
    webhookUrl: null,
    save: jest.fn(),
  };

  const mockChainConfig = {
    name: 'U2U Nebulas Testnet',
    chainId: 2484,
    rpcUrl: 'https://rpc-nebulas-testnet.uniultra.xyz',
    explorerUrl: 'https://nebulas-testnet.u2uscan.xyz',
    symbol: 'U2U',
    decimals: 18,
  };

  const mockDecryptedPrivateKey = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

  const mockTransferResult = {
    txHash: '0xtxhash123',
    from: mockUser.evmWalletAddress,
    to: mockMerchant.evmWalletAddress,
    amount: mockAmount.toString(),
    gasUsed: '21000',
    gasPrice: '1000000000',
    totalCost: '10.000021',
    blockNumber: 12345,
    explorerUrl: 'https://nebulas-testnet.u2uscan.xyz/tx/0xtxhash123',
  };

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();

    // Setup default mocks
    (getEVMChain as jest.Mock).mockReturnValue(mockChainConfig);
    (decryptPrivateKey as jest.Mock).mockReturnValue(mockDecryptedPrivateKey);
  });

  describe('processPayment - Successful Flow', () => {
    beforeEach(() => {
      // Mock Card validation
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);

      // Mock User
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Mock Merchant
      (Merchant.findOne as jest.Mock).mockResolvedValue(mockMerchant);

      // Mock Transaction create and save
      const mockTransaction = {
        _id: 'tx-123',
        userId: mockUser._id,
        cardId: mockCard._id,
        cardUuid: mockCardUuid,
        type: 'payment',
        amount: mockAmount,
        currency: mockChainConfig.symbol,
        chainId: mockChainConfig.chainId,
        chainName: mockChainConfig.name,
        merchantId: mockMerchant._id,
        merchantName: mockMerchant.merchantName,
        status: 'pending',
        fromAddress: mockUser.evmWalletAddress,
        toAddress: mockMerchant.evmWalletAddress,
        save: jest.fn().mockResolvedValue(true),
      };
      (Transaction.create as jest.Mock).mockResolvedValue(mockTransaction);

      // Mock EVM transfer
      (EVMWalletService.transfer as jest.Mock).mockResolvedValue(mockTransferResult);
    });

    it('should process payment successfully with valid inputs', async () => {
      const result = await paymentService.processPayment(
        mockCardUuid,
        mockAmount,
        mockMerchantId,
        mockChainKey
      );

      // Verify card was validated
      expect(Card.findOne).toHaveBeenCalledWith({ cardUuid: mockCardUuid });

      // Verify user was fetched
      expect(User.findById).toHaveBeenCalledWith(mockCard.userId);

      // Verify merchant was fetched
      expect(Merchant.findOne).toHaveBeenCalledWith({ merchantId: mockMerchantId });

      // Verify chain config was fetched
      expect(getEVMChain).toHaveBeenCalledWith(mockChainKey);

      // Verify transaction was created
      expect(Transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser._id,
          cardId: mockCard._id,
          amount: mockAmount,
          currency: mockChainConfig.symbol,
          chainId: mockChainConfig.chainId,
        })
      );

      // Verify private key was decrypted
      expect(decryptPrivateKey).toHaveBeenCalledWith(mockUser.evmEncryptedPrivateKey);

      // Verify EVM transfer was called
      expect(EVMWalletService.transfer).toHaveBeenCalledWith({
        privateKey: mockDecryptedPrivateKey,
        toAddress: mockMerchant.evmWalletAddress,
        amount: mockAmount.toString(),
        chainConfig: mockChainConfig,
      });

      // Verify transaction status was updated
      expect(result.status).toBe('completed');
      expect(result.txHash).toBe(mockTransferResult.txHash);

      // Verify card usage was updated
      expect(mockCard.save).toHaveBeenCalled();

      // Verify merchant stats were updated
      expect(mockMerchant.save).toHaveBeenCalled();
    });

    it('should use default chain when chainKey is not provided', async () => {
      await paymentService.processPayment(
        mockCardUuid,
        mockAmount,
        mockMerchantId
      );

      expect(getEVMChain).toHaveBeenCalledWith(DEFAULT_EVM_CHAIN);
    });

    it('should include metadata in transaction', async () => {
      const metadata = { orderId: 'order-123', description: 'Test payment' };

      await paymentService.processPayment(
        mockCardUuid,
        mockAmount,
        mockMerchantId,
        mockChainKey,
        metadata
      );

      expect(Transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata,
        })
      );
    });

    it('should update card daily and monthly spending', async () => {
      // Create fresh mock for this test
      const freshCard = {
        ...mockCard,
        dailySpent: 0,
        monthlySpent: 0,
        usageCount: 0,
      };
      (Card.findOne as jest.Mock).mockResolvedValue(freshCard);

      await paymentService.processPayment(
        mockCardUuid,
        mockAmount,
        mockMerchantId,
        mockChainKey
      );

      expect(freshCard.dailySpent).toBe(mockAmount);
      expect(freshCard.monthlySpent).toBe(mockAmount);
      expect(freshCard.usageCount).toBe(1);
      expect(freshCard.lastUsed).toBeInstanceOf(Date);
    });

    it('should update merchant total transactions and volume', async () => {
      // Create fresh mock for this test
      const freshMerchant = {
        ...mockMerchant,
        totalTransactions: 0,
        totalVolume: 0,
      };
      (Merchant.findOne as jest.Mock).mockResolvedValue(freshMerchant);

      await paymentService.processPayment(
        mockCardUuid,
        mockAmount,
        mockMerchantId,
        mockChainKey
      );

      expect(freshMerchant.totalTransactions).toBe(1);
      expect(freshMerchant.totalVolume).toBe(mockAmount);
    });
  });

  describe('processPayment - Validation Errors', () => {
    it('should throw error when card is not found', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Card not found');
    });

    it('should throw error when card is not active', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue({
        ...mockCard,
        isActive: false,
      });

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Card is not active');
    });

    it('should throw error when card is expired', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue({
        ...mockCard,
        isExpired: true,
      });

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Card has expired');
    });

    it('should throw error when card is blocked', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue({
        ...mockCard,
        blockedAt: new Date(),
        blockedReason: 'Suspicious activity',
      });

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Card is blocked');
    });

    it('should throw error when user is not found', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('User not found');
    });

    it('should throw error when merchant is not found', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Invalid merchant');
    });

    it('should throw error when merchant is not active', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue({
        ...mockMerchant,
        isActive: false,
      });

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Invalid merchant');
    });

    it('should throw error when chain config is invalid', async () => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue(mockMerchant);
      (getEVMChain as jest.Mock).mockReturnValue(null);

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Invalid chain configuration');
    });
  });

  describe('processPayment - Limit Checks', () => {
    beforeEach(() => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue(mockMerchant);
    });

    it('should throw error when daily limit is exceeded', async () => {
      const cardWithHighSpending = {
        ...mockCard,
        dailySpent: 995,
      };
      (Card.findOne as jest.Mock).mockResolvedValue(cardWithHighSpending);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          dailyLimit: 1000,
        }),
      });

      await expect(
        paymentService.processPayment(mockCardUuid, 10, mockMerchantId)
      ).rejects.toThrow('Daily limit exceeded');
    });

    it('should throw error when monthly limit is exceeded', async () => {
      const cardWithHighSpending = {
        ...mockCard,
        monthlySpent: 9995,
      };
      (Card.findOne as jest.Mock).mockResolvedValue(cardWithHighSpending);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          monthlyLimit: 10000,
        }),
      });

      await expect(
        paymentService.processPayment(mockCardUuid, 10, mockMerchantId)
      ).rejects.toThrow('Monthly limit exceeded');
    });
  });

  describe('processPayment - Blockchain Transaction Failures', () => {
    beforeEach(() => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue(mockMerchant);

      const mockTransaction = {
        _id: 'tx-123',
        userId: mockUser._id,
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      (Transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
    });

    it('should update transaction status to failed when EVM transfer fails', async () => {
      const mockFailedTransaction = {
        _id: 'tx-failed-123',
        userId: mockUser._id,
        status: 'pending',
        failureReason: '',
        save: jest.fn(function() {
          // Update the status on save
          return Promise.resolve(this);
        }),
      };
      (Transaction.create as jest.Mock).mockResolvedValue(mockFailedTransaction);

      (EVMWalletService.transfer as jest.Mock).mockRejectedValue(
        new Error('Insufficient balance for transfer')
      );

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Insufficient balance for transfer');

      // Verify transaction status was updated to failed
      expect(mockFailedTransaction.status).toBe('failed');
      expect(mockFailedTransaction.failureReason).toBe('Insufficient balance for transfer');
      expect(mockFailedTransaction.save).toHaveBeenCalled();
    });

    it('should handle insufficient balance error', async () => {
      (EVMWalletService.transfer as jest.Mock).mockRejectedValue(
        new Error('Insufficient balance for transfer')
      );

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Insufficient balance for transfer');
    });

    it('should handle gas estimation error', async () => {
      (EVMWalletService.transfer as jest.Mock).mockRejectedValue(
        new Error('Gas estimation failed. Please adjust gas parameters.')
      );

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Gas estimation failed');
    });

    it('should handle nonce error', async () => {
      (EVMWalletService.transfer as jest.Mock).mockRejectedValue(
        new Error('Transaction nonce error. Please try again.')
      );

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Transaction nonce error');
    });

    it('should handle generic transfer failure', async () => {
      (EVMWalletService.transfer as jest.Mock).mockRejectedValue(
        new Error('Transfer failed')
      );

      await expect(
        paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId)
      ).rejects.toThrow('Transfer failed');
    });
  });

  describe('processPayment - Edge Cases', () => {
    beforeEach(() => {
      (Card.findOne as jest.Mock).mockResolvedValue(mockCard);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (Merchant.findOne as jest.Mock).mockResolvedValue(mockMerchant);

      const mockTransaction = {
        _id: 'tx-123',
        userId: mockUser._id,
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      (Transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (EVMWalletService.transfer as jest.Mock).mockResolvedValue(mockTransferResult);
    });

    it('should handle very small amounts', async () => {
      const result = await paymentService.processPayment(
        mockCardUuid,
        0.0001,
        mockMerchantId
      );

      expect(EVMWalletService.transfer).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '0.0001',
        })
      );
      expect(result.status).toBe('completed');
    });

    it('should handle large amounts', async () => {
      const largeAmount = 500;
      // Update user with higher limits
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          dailyLimit: 10000,
          monthlyLimit: 50000,
        }),
      });

      const result = await paymentService.processPayment(
        mockCardUuid,
        largeAmount,
        mockMerchantId
      );

      expect(EVMWalletService.transfer).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: largeAmount.toString(),
        })
      );
      expect(result.status).toBe('completed');
    });

    it('should reset daily spending on new day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const cardWithOldDate = {
        ...mockCard,
        dailySpent: 100,
        monthlySpent: 100,
        lastResetDate: yesterday,
        save: jest.fn().mockResolvedValue(true),
      };
      (Card.findOne as jest.Mock).mockResolvedValue(cardWithOldDate);

      await paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId);

      // After reset and then adding the payment amount
      // dailySpent should equal mockAmount (0 after reset + mockAmount)
      expect(cardWithOldDate.dailySpent).toBe(mockAmount);
      // Should be saved before processing payment
      expect(cardWithOldDate.save).toHaveBeenCalled();
    });

    it('should reset monthly spending on new month', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const cardWithOldDate = {
        ...mockCard,
        dailySpent: 100,
        monthlySpent: 500,
        lastResetDate: lastMonth,
        save: jest.fn().mockResolvedValue(true),
      };
      (Card.findOne as jest.Mock).mockResolvedValue(cardWithOldDate);

      await paymentService.processPayment(mockCardUuid, mockAmount, mockMerchantId);

      // Both daily and monthly spending should be reset then have the new amount added
      expect(cardWithOldDate.dailySpent).toBe(mockAmount);
      expect(cardWithOldDate.monthlySpent).toBe(mockAmount);
      expect(cardWithOldDate.save).toHaveBeenCalled();
    });
  });
});
