import { ethers, Contract } from 'ethers';
import { getEVMChain, EVMChainConfig } from '../config/evm.config';
import logger from '../utils/logger';
import contractABIJson from '../../abi/contract.json';

const contractABI = contractABIJson as any;

const CONTRACT_ADDRESS = process.env.U2U_CONTRACT_ADDRESS || '0xbCB10Bb393215BdC90b7d913604C00A558997cee';

// Transaction Status Enum (matching smart contract)
export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Refunded = 2,
}

// Interfaces
export interface MerchantInfo {
  businessName: string;
  isActive: boolean;
  totalTransactions: number;
  totalRevenue: string; // in Wei
}

export interface TransactionDetails {
  transactionId: number;
  merchant: string;
  user: string;
  amount: string; // in Wei
  timestamp: number;
  paymentMethod: string;
  status: TransactionStatus;
}

export interface PaymentParams {
  merchantAddress: string;
  amount: string; // in U2U tokens
  paymentMethod: string;
  privateKey: string; // User's private key for signing
}

export interface ConfirmPaymentParams {
  transactionId: number;
  privateKey: string; // Merchant's private key
}

export interface RefundPaymentParams {
  transactionId: number;
  privateKey: string; // Merchant's private key
}

export interface RegisterMerchantParams {
  businessName: string;
  privateKey: string; // Merchant's private key
}

export class U2UContractService {
  private static contract: Contract;
  private static provider: ethers.JsonRpcProvider;
  private static chainConfig: EVMChainConfig;

  /**
   * Initialize contract service
   */
  static initialize(chainKey: string = 'u2u') {
    const config = getEVMChain(chainKey);
    if (!config) {
      throw new Error(`Chain configuration not found for: ${chainKey}`);
    }

    this.chainConfig = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider);

    logger.info('U2U Contract Service initialized', {
      chain: config.name,
      contractAddress: CONTRACT_ADDRESS,
    });
  }

  /**
   * Get contract instance with signer
   */
  private static getContractWithSigner(privateKey: string): Contract {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return this.contract.connect(wallet) as Contract;
  }

  /**
   * Register a new merchant
   */
  static async registerMerchant(params: RegisterMerchantParams): Promise<{
    success: boolean;
    txHash: string;
    merchantAddress: string;
  }> {
    try {
      const { businessName, privateKey } = params;

      const contractWithSigner = this.getContractWithSigner(privateKey);
      const wallet = new ethers.Wallet(privateKey);

      logger.info('Registering merchant', { businessName, address: wallet.address });

      const tx = await contractWithSigner.registerMerchant(businessName);
      const receipt = await tx.wait();

      logger.info('Merchant registered successfully', {
        txHash: receipt.hash,
        merchantAddress: wallet.address,
      });

      return {
        success: true,
        txHash: receipt.hash,
        merchantAddress: wallet.address,
      };
    } catch (error) {
      logger.error('Failed to register merchant:', error);
      throw new Error('Failed to register merchant');
    }
  }

  /**
   * Create a payment
   */
  static async createPayment(params: PaymentParams): Promise<{
    success: boolean;
    txHash: string;
    transactionId: number;
  }> {
    try {
      const { merchantAddress, amount, paymentMethod, privateKey } = params;

      const contractWithSigner = this.getContractWithSigner(privateKey);
      const wallet = new ethers.Wallet(privateKey);

      // Convert amount to Wei
      const amountInWei = ethers.parseUnits(amount, 18);

      logger.info('Creating payment', {
        from: wallet.address,
        merchant: merchantAddress,
        amount,
        paymentMethod,
      });

      // Send transaction with value
      const tx = await contractWithSigner.createPayment(merchantAddress, paymentMethod, {
        value: amountInWei,
      });

      const receipt = await tx.wait();

      // Parse events to get transaction ID
      let transactionId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsedLog && parsedLog.name === 'PaymentInitiated') {
            transactionId = Number(parsedLog.args.transactionId);
            break;
          }
        } catch (e) {
          // Skip logs that don't match our ABI
          continue;
        }
      }

      logger.info('Payment created successfully', {
        txHash: receipt.hash,
        transactionId,
      });

      return {
        success: true,
        txHash: receipt.hash,
        transactionId,
      };
    } catch (error) {
      logger.error('Failed to create payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Confirm a payment (merchant only)
   */
  static async confirmPayment(params: ConfirmPaymentParams): Promise<{
    success: boolean;
    txHash: string;
  }> {
    try {
      const { transactionId, privateKey } = params;

      const contractWithSigner = this.getContractWithSigner(privateKey);

      logger.info('Confirming payment', { transactionId });

      const tx = await contractWithSigner.confirmPayment(transactionId);
      const receipt = await tx.wait();

      logger.info('Payment confirmed successfully', {
        txHash: receipt.hash,
        transactionId,
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Failed to confirm payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  /**
   * Refund a payment (merchant only)
   */
  static async refundPayment(params: RefundPaymentParams): Promise<{
    success: boolean;
    txHash: string;
  }> {
    try {
      const { transactionId, privateKey } = params;

      const contractWithSigner = this.getContractWithSigner(privateKey);

      logger.info('Refunding payment', { transactionId });

      const tx = await contractWithSigner.refundPayment(transactionId);
      const receipt = await tx.wait();

      logger.info('Payment refunded successfully', {
        txHash: receipt.hash,
        transactionId,
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Failed to refund payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  /**
   * Get merchant information
   */
  static async getMerchantInfo(merchantAddress: string): Promise<MerchantInfo> {
    try {
      const result = await this.contract.getMerchantInfo(merchantAddress);

      return {
        businessName: result.businessName,
        isActive: result.isActive,
        totalTransactions: Number(result.totalTransactions),
        totalRevenue: result.totalRevenue.toString(),
      };
    } catch (error) {
      logger.error('Failed to get merchant info:', error);
      throw new Error('Failed to get merchant information');
    }
  }

  /**
   * Get transaction details
   */
  static async getTransactionDetails(transactionId: number): Promise<TransactionDetails> {
    try {
      const result = await this.contract.getTransactionDetails(transactionId);

      return {
        transactionId,
        merchant: result.merchant,
        user: result.user,
        amount: result.amount.toString(),
        timestamp: Number(result.timestamp),
        paymentMethod: result.paymentMethod,
        status: Number(result.status) as TransactionStatus,
      };
    } catch (error) {
      logger.error('Failed to get transaction details:', error);
      throw new Error('Failed to get transaction details');
    }
  }

  /**
   * Get merchant transactions
   */
  static async getMerchantTransactions(merchantAddress: string): Promise<number[]> {
    try {
      const result = await this.contract.getMerchantTransactions(merchantAddress);
      return result.map((id: bigint) => Number(id));
    } catch (error) {
      logger.error('Failed to get merchant transactions:', error);
      throw new Error('Failed to get merchant transactions');
    }
  }

  /**
   * Get user transactions
   */
  static async getUserTransactions(userAddress: string): Promise<number[]> {
    try {
      const result = await this.contract.getUserTransactions(userAddress);
      return result.map((id: bigint) => Number(id));
    } catch (error) {
      logger.error('Failed to get user transactions:', error);
      throw new Error('Failed to get user transactions');
    }
  }

  /**
   * Get platform fee percentage
   */
  static async getPlatformFeePercent(): Promise<number> {
    try {
      const result = await this.contract.platformFeePercent();
      return Number(result);
    } catch (error) {
      logger.error('Failed to get platform fee:', error);
      throw new Error('Failed to get platform fee');
    }
  }

  /**
   * Get transaction counter
   */
  static async getTransactionCounter(): Promise<number> {
    try {
      const result = await this.contract.transactionCounter();
      return Number(result);
    } catch (error) {
      logger.error('Failed to get transaction counter:', error);
      throw new Error('Failed to get transaction counter');
    }
  }

  /**
   * Deactivate merchant (owner only)
   */
  static async deactivateMerchant(
    merchantAddress: string,
    ownerPrivateKey: string
  ): Promise<{
    success: boolean;
    txHash: string;
  }> {
    try {
      const contractWithSigner = this.getContractWithSigner(ownerPrivateKey);

      logger.info('Deactivating merchant', { merchantAddress });

      const tx = await contractWithSigner.deactivateMerchant(merchantAddress);
      const receipt = await tx.wait();

      logger.info('Merchant deactivated successfully', {
        txHash: receipt.hash,
        merchantAddress,
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Failed to deactivate merchant:', error);
      throw new Error('Failed to deactivate merchant');
    }
  }

  /**
   * Update platform fee (owner only)
   */
  static async updatePlatformFee(
    newFeePercent: number,
    ownerPrivateKey: string
  ): Promise<{
    success: boolean;
    txHash: string;
  }> {
    try {
      const contractWithSigner = this.getContractWithSigner(ownerPrivateKey);

      logger.info('Updating platform fee', { newFeePercent });

      const tx = await contractWithSigner.updatePlatformFee(newFeePercent);
      const receipt = await tx.wait();

      logger.info('Platform fee updated successfully', {
        txHash: receipt.hash,
        newFeePercent,
      });

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      logger.error('Failed to update platform fee:', error);
      throw new Error('Failed to update platform fee');
    }
  }

  /**
   * Get contract address
   */
  static getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  /**
   * Get chain config
   */
  static getChainConfig(): EVMChainConfig {
    return this.chainConfig;
  }

  /**
   * Format amount from Wei to U2U
   */
  static formatAmount(amountInWei: string): string {
    return ethers.formatUnits(amountInWei, 18);
  }

  /**
   * Parse amount from U2U to Wei
   */
  static parseAmount(amount: string): string {
    return ethers.parseUnits(amount, 18).toString();
  }
}
