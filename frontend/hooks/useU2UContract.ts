import { useState, useCallback } from "react";
import { u2uContractAPI } from "@/lib/u2u-contract-api";
import type {
    RegisterMerchantParams,
    CreatePaymentParams,
    ConfirmPaymentParams,
    RefundPaymentParams,
    TransactionDetails,
    MerchantInfo,
} from "@/lib/u2u-contract-api";

export function useU2UContract() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((err: unknown) => {
        const errorMsg =
            err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMsg);
        console.error("U2U Contract Error:", err);
        return errorMsg;
    }, []);

    // ==================== Merchant Management ====================

    const registerMerchant = useCallback(
        async (params: RegisterMerchantParams) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.registerMerchant(params);

                if (!response.success) {
                    throw new Error(response.error || "Failed to register merchant");
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    const getMerchantInfo = useCallback(
        async (merchantAddress: string): Promise<MerchantInfo | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.getMerchantInfo(
                    merchantAddress
                );

                if (!response.success) {
                    throw new Error(
                        response.error || "Failed to get merchant info"
                    );
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    const getMerchantTransactions = useCallback(
        async (merchantAddress: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.getMerchantTransactions(
                    merchantAddress
                );

                if (!response.success) {
                    throw new Error(
                        response.error || "Failed to get merchant transactions"
                    );
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    // ==================== Payment Operations ====================

    const createPayment = useCallback(
        async (params: CreatePaymentParams) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.createPayment(params);

                if (!response.success) {
                    throw new Error(response.error || "Failed to create payment");
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    const confirmPayment = useCallback(
        async (params: ConfirmPaymentParams) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.confirmPayment(params);

                if (!response.success) {
                    throw new Error(response.error || "Failed to confirm payment");
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    const refundPayment = useCallback(
        async (params: RefundPaymentParams) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.refundPayment(params);

                if (!response.success) {
                    throw new Error(response.error || "Failed to refund payment");
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    // ==================== Transaction Queries ====================

    const getTransactionDetails = useCallback(
        async (transactionId: number): Promise<TransactionDetails | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.getTransactionDetails(
                    transactionId
                );

                if (!response.success) {
                    throw new Error(
                        response.error || "Failed to get transaction details"
                    );
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    const getUserTransactions = useCallback(
        async (userAddress: string) => {
            setLoading(true);
            setError(null);

            try {
                const response = await u2uContractAPI.getUserTransactions(
                    userAddress
                );

                if (!response.success) {
                    throw new Error(
                        response.error || "Failed to get user transactions"
                    );
                }

                return response.data!;
            } catch (err) {
                handleError(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [handleError]
    );

    // ==================== Contract Info ====================

    const getContractInfo = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await u2uContractAPI.getContractInfo();

            if (!response.success) {
                throw new Error(response.error || "Failed to get contract info");
            }

            return response.data!;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    const getPlatformStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await u2uContractAPI.getPlatformStats();

            if (!response.success) {
                throw new Error(response.error || "Failed to get platform stats");
            }

            return response.data!;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    // ==================== Utility Functions ====================

    const getTransactionExplorerUrl = useCallback((txHash: string) => {
        return u2uContractAPI.getTransactionExplorerUrl(txHash);
    }, []);

    const getAddressExplorerUrl = useCallback((address: string) => {
        return u2uContractAPI.getAddressExplorerUrl(address);
    }, []);

    const getContractExplorerUrl = useCallback(() => {
        return u2uContractAPI.getContractExplorerUrl();
    }, []);

    return {
        // State
        loading,
        error,

        // Merchant Management
        registerMerchant,
        getMerchantInfo,
        getMerchantTransactions,

        // Payment Operations
        createPayment,
        confirmPayment,
        refundPayment,

        // Transaction Queries
        getTransactionDetails,
        getUserTransactions,

        // Contract Info
        getContractInfo,
        getPlatformStats,

        // Utility
        getTransactionExplorerUrl,
        getAddressExplorerUrl,
        getContractExplorerUrl,
    };
}
