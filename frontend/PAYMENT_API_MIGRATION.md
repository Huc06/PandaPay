# Payment API Migration Guide

## Overview

This document outlines the migration from the old card-based payment system to the new U2U blockchain-based smart contract payment system.

## Current Payment Flows

### 1. **Old System (Card-based)**

#### QR Code Payment
- **File**: `components/screens/HomeScreen.tsx`
- **Endpoint**: `POST /api/payment/process-direct`
- **Flow**:
  1. User scans QR code with merchant payment request
  2. User enters PIN
  3. System validates card and PIN
  4. Process payment directly through backend
  5. Update wallet balance

#### NFC Payment
- **Files**:
  - `components/merchant/nfc/NFCTerminal.tsx`
  - `app/test-payment/page.tsx`
- **Endpoints**:
  - `POST /api/pos/initiate` - Initiate payment session
  - `POST /api/payment/process-direct` - Process payment with PIN
- **Flow**:
  1. Customer taps NFC card on terminal
  2. System initiates POS session
  3. Customer enters PIN
  4. Process payment with card UUID and PIN

### 2. **New System (U2U Smart Contract)**

#### Payment Flow
- **Endpoint**: `POST /api/u2u-contract/payment/create`
- **Flow**:
  1. Customer creates payment transaction on blockchain
  2. Smart contract holds funds in pending state
  3. Merchant confirms payment after delivery
  4. Smart contract releases funds to merchant

## Migration Options

### Option 1: Dual Support (Recommended)

Support both old and new systems, allowing gradual migration.

#### Implementation:

```typescript
// Add payment method selection
enum PaymentMode {
    CARD = "card",        // Old system
    U2U_CONTRACT = "u2u"  // New system
}

// User settings or merchant settings
interface PaymentSettings {
    preferredMode: PaymentMode;
    allowedModes: PaymentMode[];
}
```

### Option 2: Full Migration

Replace all card-based payment with U2U contract.

## Migration Steps

### Step 1: Add U2U Wallet Management

Users need U2U wallets instead of (or in addition to) cards.

```typescript
// WalletContext additions
interface UserWallet {
    address: string;           // U2U address (0x...)
    balance: number;          // U2U balance
    privateKey?: string;      // Encrypted, stored securely
}
```

### Step 2: Update Payment Components

#### HomeScreen QR Payment

**Before (Card-based)**:
```typescript
// Uses card UUID and PIN
const response = await fetch(`${backend}/api/payment/process-direct`, {
    method: "POST",
    body: JSON.stringify({
        cardUuid: userCards[0].cardUuid,
        amount: qrPayload.amount,
        merchantId: qrPayload.merchantId,
        pin: pin,
        requestId: qrPayload.requestId,
    }),
});
```

**After (U2U Contract)**:
```typescript
import { useU2UContract } from "@/hooks/useU2UContract";

const { createPayment } = useU2UContract();

// User initiates payment with their private key
const result = await createPayment({
    merchantAddress: qrPayload.merchantId,
    amount: qrPayload.amount.toString(),
    paymentMethod: "QR",
    privateKey: userWallet.privateKey, // Must be securely managed
});

// Show transaction ID and wait for merchant confirmation
console.log("Transaction ID:", result.transactionId);
```

#### NFCTerminal Payment

**Before (POS Session)**:
```typescript
// Initiate POS session
const res = await fetch(`${backendUrl}/api/pos/initiate`, {
    method: "POST",
    body: JSON.stringify({
        cardUuid: uuid,
        amount: parseFloat(amount),
        merchantId: "mch_...",
        terminalId: "MAIN_COUNTER_01",
        description: "NFC Payment",
    }),
});

// Process with PIN
const res2 = await fetch(`${backendUrl}/api/payment/process-direct`, {
    method: "POST",
    body: JSON.stringify({
        cardUuid,
        amount: parseFloat(amount),
        merchantId: "mch_...",
        pin,
    }),
});
```

**After (U2U Contract)**:
```typescript
import { useU2UContract } from "@/hooks/useU2UContract";

const { createPayment, confirmPayment } = useU2UContract();

// Customer creates payment (reads wallet address from NFC card)
const result = await createPayment({
    merchantAddress: merchantWalletAddress,
    amount: amount,
    paymentMethod: "POS",
    privateKey: customerPrivateKey,
});

// Merchant confirms payment after service delivered
// (This happens from merchant's device/terminal)
await confirmPayment({
    transactionId: result.transactionId,
    privateKey: merchantPrivateKey,
});
```

### Step 3: Secure Private Key Management

**⚠️ CRITICAL SECURITY CONSIDERATIONS:**

Never store private keys in:
- Local storage
- Session storage
- Cookies
- Plain text

**Recommended Approaches:**

#### Option A: Web3 Wallet Integration (Best)
```typescript
// Use MetaMask or similar wallet
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Sign transaction with user's wallet
const tx = await signer.sendTransaction({
    to: merchantAddress,
    value: ethers.utils.parseEther(amount),
});
```

#### Option B: Encrypted Storage (Good)
```typescript
// Encrypt private key with user's PIN
import CryptoJS from 'crypto-js';

function encryptPrivateKey(privateKey: string, pin: string): string {
    return CryptoJS.AES.encrypt(privateKey, pin).toString();
}

function decryptPrivateKey(encrypted: string, pin: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, pin);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Store encrypted key
localStorage.setItem('encrypted_key', encryptPrivateKey(key, pin));

// Decrypt when needed
const pin = prompt('Enter PIN');
const privateKey = decryptPrivateKey(encrypted, pin);
```

#### Option C: Backend Key Management (Acceptable)
```typescript
// Backend holds encrypted keys, decrypts with user's PIN/biometric
const response = await api.post('/wallet/sign-transaction', {
    transactionData: {
        to: merchantAddress,
        value: amount,
    },
    pin: userPin,
});
```

### Step 4: Update QR Code Format

**Old Format**:
```json
{
    "requestId": "req_123",
    "amount": 10.5,
    "merchantId": "mch_abc",
    "currency": "U2U"
}
```

**New Format** (include merchant wallet address):
```json
{
    "requestId": "req_123",
    "amount": "0.01",
    "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
    "merchantId": "mch_abc",
    "currency": "U2U",
    "paymentMethod": "QR"
}
```

### Step 5: Update Merchant Dashboard

Merchants need to:
1. Register their wallet address on the smart contract
2. Confirm pending payments
3. View blockchain transactions

```typescript
// Merchant registration
const { registerMerchant, confirmPayment } = useU2UContract();

// One-time registration
await registerMerchant({
    businessName: "My Coffee Shop",
    privateKey: merchantPrivateKey,
});

// Confirm customer payments
await confirmPayment({
    transactionId: pendingTx.id,
    privateKey: merchantPrivateKey,
});
```

## Comparison Table

| Feature | Old System (Card) | New System (U2U Contract) |
|---------|-------------------|---------------------------|
| Authentication | Card UUID + PIN | Private Key / Web3 Wallet |
| Transaction Speed | Instant | ~5-10 seconds (blockchain) |
| Reversibility | Database record | Smart contract (refund required) |
| Transparency | Backend only | Blockchain explorer |
| Fees | None (internal) | Gas fees (~0.0001 U2U) |
| Merchant Confirmation | Not required | Required for fund release |
| Security | PIN-based | Cryptographic signatures |
| Offline Support | No | No |
| Cross-platform | Backend-dependent | Blockchain-native |

## Implementation Example: Hybrid Component

```typescript
"use client";

import { useState } from "react";
import { useU2UContract } from "@/hooks/useU2UContract";

interface PaymentConfig {
    mode: "card" | "u2u";
}

export default function HybridPayment({ config }: { config: PaymentConfig }) {
    const [pin, setPin] = useState("");
    const { createPayment } = useU2UContract();

    const handlePayment = async (merchantId: string, amount: number) => {
        if (config.mode === "card") {
            // Old flow
            const response = await fetch("/api/payment/process-direct", {
                method: "POST",
                body: JSON.stringify({
                    cardUuid: userCard.uuid,
                    amount,
                    merchantId,
                    pin,
                }),
            });
            return response.json();
        } else {
            // New flow
            const result = await createPayment({
                merchantAddress: merchantWalletAddress,
                amount: amount.toString(),
                paymentMethod: "QR",
                privateKey: userPrivateKey,
            });
            return result;
        }
    };

    return (
        <div>
            {config.mode === "card" ? (
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                />
            ) : (
                <p>Payment will be signed with your wallet</p>
            )}
            <button onClick={() => handlePayment("mch_123", 10)}>
                Pay Now
            </button>
        </div>
    );
}
```

## Testing Strategy

### Phase 1: Parallel Testing
- Run both systems simultaneously
- Compare results
- Monitor performance and errors

### Phase 2: Gradual Rollout
- Enable U2U for new users first
- Migrate existing users in batches
- Keep card system as fallback

### Phase 3: Full Migration
- Deprecate card-based payment
- Remove old API endpoints
- Complete blockchain migration

## Rollback Plan

In case of issues:

1. **Immediate**: Feature flag to disable U2U payments
```typescript
const USE_U2U_CONTRACT = process.env.NEXT_PUBLIC_ENABLE_U2U === 'true';

if (USE_U2U_CONTRACT) {
    // Use blockchain
} else {
    // Use old card system
}
```

2. **Data Migration**: Keep transaction records in both systems during transition
3. **User Communication**: Notify users of system changes

## Security Checklist

- [ ] Private keys never sent to frontend in plain text
- [ ] Encryption for key storage
- [ ] Rate limiting on payment endpoints
- [ ] Transaction amount validation
- [ ] Merchant address validation
- [ ] Gas fee estimation before transaction
- [ ] Error handling for failed transactions
- [ ] Audit logs for all payment operations
- [ ] Multi-signature support for high-value transactions
- [ ] Regular security audits of smart contract

## Next Steps

1. **Backend**: Implement hybrid payment router
2. **Frontend**: Add payment mode selection UI
3. **Wallet**: Implement secure key management
4. **Testing**: Create comprehensive test suite
5. **Documentation**: Update user and merchant guides
6. **Training**: Train support team on new system

## Resources

- **U2U Contract API**: `/backend/U2U_CONTRACT_API_DOCUMENTATION.md`
- **Frontend Integration**: `/frontend/U2U_CONTRACT_INTEGRATION.md`
- **Smart Contract**: `/contract/payment/payment.sol`
- **Hook Documentation**: `/frontend/hooks/useU2UContract.ts`
