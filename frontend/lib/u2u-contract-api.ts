import axios, { AxiosError } from "axios";

const API_BASE_URL = `${
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
}/api/u2u-contract`;

// ==================== Interfaces ====================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Contract Info
export interface ContractInfo {
    contractAddress: string;
    explorerUrl: string;
    chain: {
        name: string;
        chainId: number;
        symbol: string;
        rpcUrl: string;
        explorerUrl: string;
        isTestnet: boolean;
    };
}

// Platform Stats
export interface PlatformStats {
    platformFeePercent: number;
    totalTransactions: number;
    contractAddress: string;
    chain: {
        name: string;
        chainId: number;
        symbol: string;
        explorerUrl: string;
    };
}

// Merchant Info
export interface MerchantInfo {
    businessName: string;
    isActive: boolean;
    totalTransactions: number;
    totalRevenue: string; // Wei
    totalRevenueFormatted: string; // e.g., "0.0099 U2U"
}

// Transaction Details
export enum TransactionStatus {
    Pending = 0,
    Completed = 1,
    Refunded = 2,
}

export interface TransactionDetails {
    transactionId: number;
    merchant: string;
    user: string;
    amount: string; // Wei
    timestamp: number;
    paymentMethod: string;
    status: TransactionStatus;
    amountFormatted: string; // e.g., "0.01 U2U"
}

// Register Merchant
export interface RegisterMerchantParams {
    businessName: string;
    privateKey: string;
}

export interface RegisterMerchantResult {
    success: boolean;
    txHash: string;
    merchantAddress: string;
}

// Create Payment
export interface CreatePaymentParams {
    merchantAddress: string;
    amount: string; // in U2U tokens (e.g., "0.01")
    paymentMethod: "POS" | "QR";
    privateKey: string; // Customer's private key
}

export interface CreatePaymentResult {
    success: boolean;
    txHash: string;
    transactionId: number;
}

// Confirm Payment
export interface ConfirmPaymentParams {
    transactionId: number;
    privateKey: string; // Merchant's private key
}

export interface ConfirmPaymentResult {
    success: boolean;
    txHash: string;
}

// Refund Payment
export interface RefundPaymentParams {
    transactionId: number;
    privateKey: string; // Merchant's private key
}

export interface RefundPaymentResult {
    success: boolean;
    txHash: string;
}

// Transaction IDs
export interface TransactionIdsResponse {
    merchantAddress?: string;
    userAddress?: string;
    transactionIds: number[];
    count: number;
}

// ==================== U2U Contract API Client ====================

class U2UContractAPIClient {
    private handleError<T>(error: unknown): ApiResponse<T> {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ error?: string }>;
            return {
                success: false,
                error:
                    axiosError.response?.data?.error ||
                    axiosError.message ||
                    "Unknown error",
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }

    // ==================== Contract Information ====================

    /**
     * Get contract information
     * GET /info
     */
    async getContractInfo(): Promise<ApiResponse<ContractInfo>> {
        try {
            const response = await axios.get(`${API_BASE_URL}/info`);
            return response.data;
        } catch (error) {
            return this.handleError<ContractInfo>(error);
        }
    }

    /**
     * Get platform statistics
     * GET /stats
     */
    async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
        try {
            const response = await axios.get(`${API_BASE_URL}/stats`);
            return response.data;
        } catch (error) {
            return this.handleError<PlatformStats>(error);
        }
    }

    // ==================== Merchant Management ====================

    /**
     * Register a new merchant
     * POST /merchant/register
     */
    async registerMerchant(
        params: RegisterMerchantParams
    ): Promise<ApiResponse<RegisterMerchantResult>> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/merchant/register`,
                params
            );
            return response.data;
        } catch (error) {
            return this.handleError<RegisterMerchantResult>(error);
        }
    }

    /**
     * Get merchant information
     * GET /merchant/:address
     */
    async getMerchantInfo(
        merchantAddress: string
    ): Promise<ApiResponse<MerchantInfo>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/merchant/${merchantAddress}`
            );
            return response.data;
        } catch (error) {
            return this.handleError<MerchantInfo>(error);
        }
    }

    /**
     * Get merchant transactions
     * GET /merchant/:address/transactions
     */
    async getMerchantTransactions(
        merchantAddress: string
    ): Promise<ApiResponse<TransactionIdsResponse>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/merchant/${merchantAddress}/transactions`
            );
            return response.data;
        } catch (error) {
            return this.handleError<TransactionIdsResponse>(error);
        }
    }

    /**
     * Deactivate merchant (admin only)
     * POST /merchant/:address/deactivate
     */
    async deactivateMerchant(
        merchantAddress: string,
        ownerPrivateKey: string
    ): Promise<ApiResponse<{ success: boolean; txHash: string }>> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/merchant/${merchantAddress}/deactivate`,
                { ownerPrivateKey }
            );
            return response.data;
        } catch (error) {
            return this.handleError<{ success: boolean; txHash: string }>(
                error
            );
        }
    }

    // ==================== Payment Operations ====================

    /**
     * Create a payment
     * POST /payment/create
     */
    async createPayment(
        params: CreatePaymentParams
    ): Promise<ApiResponse<CreatePaymentResult>> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payment/create`,
                params
            );
            return response.data;
        } catch (error) {
            return this.handleError<CreatePaymentResult>(error);
        }
    }

    /**
     * Confirm a payment (merchant only)
     * POST /payment/confirm
     */
    async confirmPayment(
        params: ConfirmPaymentParams
    ): Promise<ApiResponse<ConfirmPaymentResult>> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payment/confirm`,
                params
            );
            return response.data;
        } catch (error) {
            return this.handleError<ConfirmPaymentResult>(error);
        }
    }

    /**
     * Refund a payment (merchant only)
     * POST /payment/refund
     */
    async refundPayment(
        params: RefundPaymentParams
    ): Promise<ApiResponse<RefundPaymentResult>> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payment/refund`,
                params
            );
            return response.data;
        } catch (error) {
            return this.handleError<RefundPaymentResult>(error);
        }
    }

    // ==================== Transaction Queries ====================

    /**
     * Get transaction details
     * GET /transaction/:id
     */
    async getTransactionDetails(
        transactionId: number
    ): Promise<ApiResponse<TransactionDetails>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/transaction/${transactionId}`
            );
            return response.data;
        } catch (error) {
            return this.handleError<TransactionDetails>(error);
        }
    }

    /**
     * Get user transactions
     * GET /user/:address/transactions
     */
    async getUserTransactions(
        userAddress: string
    ): Promise<ApiResponse<TransactionIdsResponse>> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/user/${userAddress}/transactions`
            );
            return response.data;
        } catch (error) {
            return this.handleError<TransactionIdsResponse>(error);
        }
    }

    // ==================== Platform Administration ====================

    /**
     * Update platform fee (admin only)
     * POST /platform/fee
     */
    async updatePlatformFee(
        newFeePercent: number,
        ownerPrivateKey: string
    ): Promise<ApiResponse<{ success: boolean; txHash: string }>> {
        try {
            const response = await axios.post(`${API_BASE_URL}/platform/fee`, {
                newFeePercent,
                ownerPrivateKey,
            });
            return response.data;
        } catch (error) {
            return this.handleError<{ success: boolean; txHash: string }>(
                error
            );
        }
    }

    // ==================== Utility Functions ====================

    /**
     * Format explorer URL for transaction
     */
    getTransactionExplorerUrl(txHash: string): string {
        return `https://u2uscan.xyz/tx/${txHash}`;
    }

    /**
     * Format explorer URL for address
     */
    getAddressExplorerUrl(address: string): string {
        return `https://u2uscan.xyz/address/${address}`;
    }

    /**
     * Get contract explorer URL
     */
    getContractExplorerUrl(): string {
        return `https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee`;
    }
}

// Export singleton instance
export const u2uContractAPI = new U2UContractAPIClient();

// Export default
export default u2uContractAPI;
