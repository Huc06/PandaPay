# U2U Contract Integration - Frontend

## Overview

This document explains how to integrate U2U blockchain payment functionality into the PandaPay frontend application.

## Architecture

```
┌─────────────────┐
│   Components    │  (React/Next.js UI)
└────────┬────────┘
         │
┌────────▼────────┐
│     Hooks       │  (useU2UContract)
└────────┬────────┘
         │
┌────────▼────────┐
│   API Client    │  (u2uContractAPI)
└────────┬────────┘
         │
┌────────▼────────┐
│    Backend      │  (/api/u2u-contract)
└────────┬────────┘
         │
┌────────▼────────┐
│  U2U Contract   │  (Smart Contract on U2U Blockchain)
└─────────────────┘
```

## Files Structure

```
frontend/
├── lib/
│   ├── u2u-contract-api.ts      # API client for U2U contract
│   └── api-client.ts            # Extended with U2U methods
├── hooks/
│   └── useU2UContract.ts        # React hook for U2U operations
└── components/
    └── u2u/
        └── U2UPaymentDemo.tsx   # Demo component
```

## Getting Started

### 1. Import the Hook

```typescript
import { useU2UContract } from "@/hooks/useU2UContract";
```

### 2. Use in Component

```typescript
export default function PaymentComponent() {
    const {
        loading,
        error,
        createPayment,
        confirmPayment,
        getTransactionDetails,
    } = useU2UContract();

    // Your component logic
}
```

## API Reference

### useU2UContract Hook

The main hook for interacting with U2U smart contract.

#### State

```typescript
{
    loading: boolean;       // Loading state
    error: string | null;   // Error message
}
```

#### Merchant Management

##### registerMerchant()

Register a new merchant on the blockchain.

```typescript
const result = await registerMerchant({
    businessName: "My Coffee Shop",
    privateKey: "0x...", // Merchant's private key
});

// Result:
// {
//     success: boolean;
//     txHash: string;
//     merchantAddress: string;
// }
```

##### getMerchantInfo()

Get merchant information from blockchain.

```typescript
const merchantInfo = await getMerchantInfo("0x...merchantAddress");

// Returns:
// {
//     businessName: string;
//     isActive: boolean;
//     totalTransactions: number;
//     totalRevenue: string;              // Wei
//     totalRevenueFormatted: string;     // "0.0099 U2U"
// }
```

##### getMerchantTransactions()

Get all transaction IDs for a merchant.

```typescript
const result = await getMerchantTransactions("0x...merchantAddress");

// Returns:
// {
//     merchantAddress: string;
//     transactionIds: number[];
//     count: number;
// }
```

#### Payment Operations

##### createPayment()

Create a new payment (customer sends U2U to merchant).

```typescript
const result = await createPayment({
    merchantAddress: "0x...",
    amount: "0.01", // in U2U tokens
    paymentMethod: "POS", // "POS" or "QR"
    privateKey: "0x...", // Customer's private key
});

// Result:
// {
//     success: boolean;
//     txHash: string;
//     transactionId: number;
// }
```

**Important Notes:**

-   Customer must have sufficient U2U tokens + gas fees
-   Payment starts in "Pending" status
-   Platform fee (default 1%) is deducted on confirmation

##### confirmPayment()

Confirm a payment (merchant confirms goods/services delivered).

```typescript
const result = await confirmPayment({
    transactionId: 1,
    privateKey: "0x...", // Merchant's private key
});

// Result:
// {
//     success: boolean;
//     txHash: string;
// }
```

**Important Notes:**

-   Only merchant can confirm their transactions
-   Status changes from "Pending" (0) to "Completed" (1)
-   Platform fee is deducted and merchant receives remaining amount

##### refundPayment()

Refund a payment to customer.

```typescript
const result = await refundPayment({
    transactionId: 1,
    privateKey: "0x...", // Merchant's private key
});

// Result:
// {
//     success: boolean;
//     txHash: string;
// }
```

**Important Notes:**

-   Only merchant can refund their transactions
-   Full amount is returned to customer
-   Status changes to "Refunded" (2)

#### Transaction Queries

##### getTransactionDetails()

Get details of a specific transaction.

```typescript
const transaction = await getTransactionDetails(1);

// Returns:
// {
//     transactionId: number;
//     merchant: string;           // Merchant address
//     user: string;              // Customer address
//     amount: string;            // Wei
//     timestamp: number;         // Unix timestamp
//     paymentMethod: string;     // "POS" or "QR"
//     status: TransactionStatus; // 0=Pending, 1=Completed, 2=Refunded
//     amountFormatted: string;   // "0.01 U2U"
// }
```

##### getUserTransactions()

Get all transaction IDs for a user.

```typescript
const result = await getUserTransactions("0x...userAddress");

// Returns:
// {
//     userAddress: string;
//     transactionIds: number[];
//     count: number;
// }
```

#### Contract Info

##### getContractInfo()

Get smart contract information.

```typescript
const info = await getContractInfo();

// Returns:
// {
//     contractAddress: string;
//     explorerUrl: string;
//     chain: {
//         name: string;         // "U2U Solaris Mainnet"
//         chainId: number;      // 39
//         symbol: string;       // "U2U"
//         rpcUrl: string;
//         explorerUrl: string;
//         isTestnet: boolean;
//     }
// }
```

##### getPlatformStats()

Get platform statistics.

```typescript
const stats = await getPlatformStats();

// Returns:
// {
//     platformFeePercent: number;    // 1
//     totalTransactions: number;
//     contractAddress: string;
//     chain: {...}
// }
```

#### Utility Functions

##### getTransactionExplorerUrl()

Get blockchain explorer URL for a transaction.

```typescript
const url = getTransactionExplorerUrl("0x...txHash");
// Returns: "https://u2uscan.xyz/tx/0x...txHash"
```

##### getAddressExplorerUrl()

Get blockchain explorer URL for an address.

```typescript
const url = getAddressExplorerUrl("0x...address");
// Returns: "https://u2uscan.xyz/address/0x...address"
```

##### getContractExplorerUrl()

Get blockchain explorer URL for the smart contract.

```typescript
const url = getContractExplorerUrl();
// Returns: "https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee"
```

## Example: Complete Payment Flow

```typescript
"use client";

import { useState } from "react";
import { useU2UContract } from "@/hooks/useU2UContract";

export default function PaymentFlow() {
    const [transactionId, setTransactionId] = useState<number | null>(null);

    const {
        loading,
        error,
        createPayment,
        confirmPayment,
        getTransactionDetails,
        getTransactionExplorerUrl,
    } = useU2UContract();

    // Step 1: Customer creates payment
    const handleCreatePayment = async () => {
        try {
            const result = await createPayment({
                merchantAddress: "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
                amount: "0.01",
                paymentMethod: "POS",
                privateKey: "0x...", // Customer's private key
            });

            setTransactionId(result.transactionId);
            console.log("Payment created:", result.txHash);
            console.log("Transaction ID:", result.transactionId);
        } catch (err) {
            console.error("Failed to create payment:", err);
        }
    };

    // Step 2: Merchant confirms payment
    const handleConfirmPayment = async () => {
        if (!transactionId) return;

        try {
            const result = await confirmPayment({
                transactionId,
                privateKey: "0x...", // Merchant's private key
            });

            console.log("Payment confirmed:", result.txHash);

            // Get updated transaction details
            const details = await getTransactionDetails(transactionId);
            console.log("Transaction status:", details?.status); // 1 = Completed
        } catch (err) {
            console.error("Failed to confirm payment:", err);
        }
    };

    return (
        <div>
            <button onClick={handleCreatePayment} disabled={loading}>
                {loading ? "Creating..." : "Create Payment"}
            </button>

            {transactionId && (
                <button onClick={handleConfirmPayment} disabled={loading}>
                    {loading ? "Confirming..." : "Confirm Payment"}
                </button>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

## Example: Merchant Dashboard

```typescript
"use client";

import { useEffect, useState } from "react";
import { useU2UContract } from "@/hooks/useU2UContract";

export default function MerchantDashboard() {
    const [merchantAddress] = useState("0x...");
    const [merchantInfo, setMerchantInfo] = useState(null);
    const [transactions, setTransactions] = useState<number[]>([]);

    const { getMerchantInfo, getMerchantTransactions } = useU2UContract();

    useEffect(() => {
        loadMerchantData();
    }, []);

    const loadMerchantData = async () => {
        // Get merchant info
        const info = await getMerchantInfo(merchantAddress);
        setMerchantInfo(info);

        // Get merchant transactions
        const txs = await getMerchantTransactions(merchantAddress);
        if (txs) {
            setTransactions(txs.transactionIds);
        }
    };

    return (
        <div>
            <h1>Merchant Dashboard</h1>

            {merchantInfo && (
                <div>
                    <h2>{merchantInfo.businessName}</h2>
                    <p>Total Transactions: {merchantInfo.totalTransactions}</p>
                    <p>Total Revenue: {merchantInfo.totalRevenueFormatted}</p>
                    <p>Status: {merchantInfo.isActive ? "Active" : "Inactive"}</p>
                </div>
            )}

            <h3>Recent Transactions</h3>
            <ul>
                {transactions.map((txId) => (
                    <li key={txId}>Transaction #{txId}</li>
                ))}
            </ul>
        </div>
    );
}
```

## Transaction Statuses

```typescript
export enum TransactionStatus {
    Pending = 0, // Payment created, waiting for confirmation
    Completed = 1, // Payment confirmed by merchant
    Refunded = 2, // Payment refunded to customer
}
```

## Payment Methods

```typescript
type PaymentMethod = "POS" | "QR";
```

-   **POS**: Point of Sale terminal payment
-   **QR**: QR code scan payment

## Error Handling

All hook methods will throw errors if the operation fails. Always use try-catch blocks:

```typescript
try {
    const result = await createPayment(params);
    // Handle success
} catch (error) {
    // Handle error
    console.error("Payment failed:", error);
}
```

The `error` state in the hook will also be populated with the error message.

## Security Best Practices

### 1. Private Key Management

**NEVER** store private keys in:

-   Frontend source code
-   Local storage
-   Session storage
-   Cookies

**DO:**

-   Get private keys from secure user input only
-   Use Web3 wallets (MetaMask, etc.) in production
-   Implement proper key management system

### 2. Environment Variables

Store sensitive configuration in `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 3. Input Validation

Always validate user input before making API calls:

```typescript
if (!merchantAddress || !/^0x[0-9a-fA-F]{40}$/.test(merchantAddress)) {
    throw new Error("Invalid merchant address");
}

if (parseFloat(amount) <= 0) {
    throw new Error("Amount must be greater than 0");
}
```

## Testing

### Demo Component

Use the provided demo component to test the integration:

```typescript
import U2UPaymentDemo from "@/components/u2u/U2UPaymentDemo";

export default function TestPage() {
    return <U2UPaymentDemo />;
}
```

### Test Wallets

Use the test wallets from the backend documentation:

-   Merchant: `0x5A460fE9432355Fd723A8D330Af7F8840D88748D`
-   Customer: `0x5bdd48d5014807d1B5bf684eA6F25f404104943F`

Make sure these wallets have U2U tokens for gas fees.

## Blockchain Explorer

View transactions on U2U Explorer:

-   Contract: https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee
-   Transactions: https://u2uscan.xyz/tx/{txHash}
-   Addresses: https://u2uscan.xyz/address/{address}

## Migration from Old API

### Before (Old SUI API)

```typescript
const { processPayment } = usePayment();

await processPayment({
    cardUuid: "...",
    amount: 10,
    merchantId: "...",
    pin: "1234",
});
```

### After (New U2U Contract)

```typescript
const { createPayment, confirmPayment } = useU2UContract();

// Customer creates payment
const result = await createPayment({
    merchantAddress: "0x...",
    amount: "0.01",
    paymentMethod: "POS",
    privateKey: "0x...",
});

// Merchant confirms payment
await confirmPayment({
    transactionId: result.transactionId,
    privateKey: "0x...",
});
```

## Troubleshooting

### Common Issues

1. **Transaction Reverted**

    - Check if addresses are valid
    - Ensure payment method is "POS" or "QR"
    - Verify sufficient balance for amount + gas

2. **RPC Connection Error**

    - Check backend is running
    - Verify `NEXT_PUBLIC_BACKEND_URL`
    - Check network connectivity

3. **Invalid Private Key**
    - Ensure format is `0x` + 64 hex characters
    - No spaces or special characters

## Support

For issues or questions:

-   Backend API docs: `/backend/U2U_CONTRACT_API_DOCUMENTATION.md`
-   Smart contract: `/contract/payment/payment.sol`
-   Backend service: `/backend/src/services/u2u-contract.service.ts`

## License

MIT License
