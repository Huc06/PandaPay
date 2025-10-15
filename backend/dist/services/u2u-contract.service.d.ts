import { EVMChainConfig } from '../config/evm.config';
export declare enum TransactionStatus {
    Pending = 0,
    Completed = 1,
    Refunded = 2
}
export interface MerchantInfo {
    businessName: string;
    isActive: boolean;
    totalTransactions: number;
    totalRevenue: string;
}
export interface TransactionDetails {
    transactionId: number;
    merchant: string;
    user: string;
    amount: string;
    timestamp: number;
    paymentMethod: string;
    status: TransactionStatus;
}
export interface PaymentParams {
    merchantAddress: string;
    amount: string;
    paymentMethod: string;
    privateKey: string;
}
export interface ConfirmPaymentParams {
    transactionId: number;
    privateKey: string;
}
export interface RefundPaymentParams {
    transactionId: number;
    privateKey: string;
}
export interface RegisterMerchantParams {
    businessName: string;
    privateKey: string;
}
export declare class U2UContractService {
    private static contract;
    private static provider;
    private static chainConfig;
    /**
     * Initialize contract service
     */
    static initialize(chainKey?: string): void;
    /**
     * Get contract instance with signer
     */
    private static getContractWithSigner;
    /**
     * Register a new merchant
     */
    static registerMerchant(params: RegisterMerchantParams): Promise<{
        success: boolean;
        txHash: string;
        merchantAddress: string;
    }>;
    /**
     * Create a payment
     */
    static createPayment(params: PaymentParams): Promise<{
        success: boolean;
        txHash: string;
        transactionId: number;
    }>;
    /**
     * Confirm a payment (merchant only)
     */
    static confirmPayment(params: ConfirmPaymentParams): Promise<{
        success: boolean;
        txHash: string;
    }>;
    /**
     * Refund a payment (merchant only)
     */
    static refundPayment(params: RefundPaymentParams): Promise<{
        success: boolean;
        txHash: string;
    }>;
    /**
     * Get merchant information
     */
    static getMerchantInfo(merchantAddress: string): Promise<MerchantInfo>;
    /**
     * Get transaction details
     */
    static getTransactionDetails(transactionId: number): Promise<TransactionDetails>;
    /**
     * Get merchant transactions
     */
    static getMerchantTransactions(merchantAddress: string): Promise<number[]>;
    /**
     * Get user transactions
     */
    static getUserTransactions(userAddress: string): Promise<number[]>;
    /**
     * Get platform fee percentage
     */
    static getPlatformFeePercent(): Promise<number>;
    /**
     * Get transaction counter
     */
    static getTransactionCounter(): Promise<number>;
    /**
     * Deactivate merchant (owner only)
     */
    static deactivateMerchant(merchantAddress: string, ownerPrivateKey: string): Promise<{
        success: boolean;
        txHash: string;
    }>;
    /**
     * Update platform fee (owner only)
     */
    static updatePlatformFee(newFeePercent: number, ownerPrivateKey: string): Promise<{
        success: boolean;
        txHash: string;
    }>;
    /**
     * Get contract address
     */
    static getContractAddress(): string;
    /**
     * Get chain config
     */
    static getChainConfig(): EVMChainConfig;
    /**
     * Format amount from Wei to U2U
     */
    static formatAmount(amountInWei: string): string;
    /**
     * Parse amount from U2U to Wei
     */
    static parseAmount(amount: string): string;
}
//# sourceMappingURL=u2u-contract.service.d.ts.map