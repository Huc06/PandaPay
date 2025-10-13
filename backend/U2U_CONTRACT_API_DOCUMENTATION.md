# U2U Contract API Documentation

## Overview
API để tương tác với U2U Payment Smart Contract trên U2U Solaris Mainnet.

**Base URL**: `http://localhost:8080/api/u2u-contract`

**Contract Address**: `0xbCB10Bb393215BdC90b7d913604C00A558997cee`

**Chain**: U2U Solaris Mainnet (Chain ID: 39)

**Explorer**: https://u2uscan.xyz

---

## Table of Contents
1. [Authentication](#authentication)
2. [Contract Information](#contract-information)
3. [Merchant Management](#merchant-management)
4. [Payment Operations](#payment-operations)
5. [Transaction Queries](#transaction-queries)
6. [Platform Administration](#platform-administration)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

---

## Authentication

API sử dụng private key để ký các transaction. Private key được gửi trong request body cho các endpoint yêu cầu ghi dữ liệu lên blockchain.

⚠️ **Security Warning**:
- Không bao giờ chia sẻ private key
- Không commit private key vào git
- Trong production, nên sử dụng key management service

---

## Contract Information

### 1. Get Contract Info
Lấy thông tin về smart contract và blockchain network.

**Endpoint**: `GET /info`

**Response**:
```json
{
  "success": true,
  "data": {
    "contractAddress": "0xbCB10Bb393215BdC90b7d913604C00A558997cee",
    "explorerUrl": "https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee",
    "chain": {
      "name": "U2U Solaris Mainnet",
      "chainId": 39,
      "symbol": "U2U",
      "rpcUrl": "https://rpc-mainnet.uniultra.xyz",
      "explorerUrl": "https://u2uscan.xyz",
      "isTestnet": false
    }
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/info
```

---

### 2. Get Platform Stats
Lấy thống kê tổng quan của platform.

**Endpoint**: `GET /stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "platformFeePercent": 1,
    "totalTransactions": 10,
    "contractAddress": "0xbCB10Bb393215BdC90b7d913604C00A558997cee",
    "chain": {
      "name": "U2U Solaris Mainnet",
      "chainId": 39,
      "symbol": "U2U",
      "explorerUrl": "https://u2uscan.xyz"
    }
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/stats
```

---

## Merchant Management

### 3. Register Merchant
Đăng ký merchant mới trên smart contract.

**Endpoint**: `POST /merchant/register`

**Request Body**:
```json
{
  "businessName": "Test Coffee Shop",
  "privateKey": "0x1234...abcd"
}
```

**Validation Rules**:
- `businessName`: Required, 3-100 characters
- `privateKey`: Required, format `0x` + 64 hex characters

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x614cf234d772bc94366bd291f3d6587aed265c1d834893ec424180a4be71fd02",
    "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D"
  },
  "message": "Merchant registered successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/merchant/register \
  -H 'Content-Type: application/json' \
  -d '{
    "businessName": "My Coffee Shop",
    "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  }'
```

**Gas Required**: ~100,000 - 150,000 gas

**Smart Contract Event**: `MerchantRegistered(address indexed merchant, string businessName)`

---

### 4. Get Merchant Info
Lấy thông tin merchant từ blockchain.

**Endpoint**: `GET /merchant/:address`

**URL Parameters**:
- `address`: Ethereum address của merchant (format: `0x` + 40 hex characters)

**Response**:
```json
{
  "success": true,
  "data": {
    "businessName": "Test Coffee Shop",
    "isActive": true,
    "totalTransactions": 5,
    "totalRevenue": "49500000000000000",
    "totalRevenueFormatted": "0.0495 U2U"
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D
```

---

### 5. Get Merchant Transactions
Lấy danh sách transaction IDs của merchant.

**Endpoint**: `GET /merchant/:address/transactions`

**URL Parameters**:
- `address`: Ethereum address của merchant

**Response**:
```json
{
  "success": true,
  "data": {
    "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
    "transactionIds": [0, 1, 2, 3, 4],
    "count": 5
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D/transactions
```

---

### 6. Deactivate Merchant (Admin Only)
Vô hiệu hóa merchant (chỉ owner của contract mới có quyền).

**Endpoint**: `POST /merchant/:address/deactivate`

**URL Parameters**:
- `address`: Ethereum address của merchant cần deactivate

**Request Body**:
```json
{
  "ownerPrivateKey": "0xowner_private_key"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x..."
  },
  "message": "Merchant deactivated successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D/deactivate \
  -H 'Content-Type: application/json' \
  -d '{
    "ownerPrivateKey": "0xowner_private_key_here"
  }'
```

---

## Payment Operations

### 7. Create Payment
Tạo payment mới (customer gửi U2U token đến merchant).

**Endpoint**: `POST /payment/create`

**Request Body**:
```json
{
  "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
  "amount": "0.01",
  "paymentMethod": "POS",
  "privateKey": "0xcustomer_private_key"
}
```

**Validation Rules**:
- `merchantAddress`: Required, valid Ethereum address
- `amount`: Required, decimal number > 0 (in U2U tokens)
- `paymentMethod`: Required, must be "POS" or "QR"
- `privateKey`: Required, customer's private key

**Payment Methods**:
- `POS`: Point of Sale (thanh toán tại quầy)
- `QR`: QR Code scan

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x1893cf2efca4b6d46f941ea3564d950dc568dcb9b104c88ff61a97aec7ca8d79",
    "transactionId": 1
  },
  "message": "Payment created successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/payment/create \
  -H 'Content-Type: application/json' \
  -d '{
    "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
    "amount": "0.01",
    "paymentMethod": "POS",
    "privateKey": "0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d"
  }'
```

**Gas Required**: ~150,000 - 200,000 gas

**Smart Contract Event**: `PaymentInitiated(uint256 indexed transactionId, address indexed merchant, address indexed user, uint256 amount, string paymentMethod)`

**Notes**:
- Customer phải có đủ U2U token để thanh toán + gas fee
- Payment sẽ ở trạng thái "Pending" cho đến khi merchant confirm

---

### 8. Confirm Payment
Xác nhận payment (merchant xác nhận đã nhận hàng/dịch vụ).

**Endpoint**: `POST /payment/confirm`

**Request Body**:
```json
{
  "transactionId": 1,
  "privateKey": "0xmerchant_private_key"
}
```

**Validation Rules**:
- `transactionId`: Required, positive integer >= 0
- `privateKey`: Required, merchant's private key

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x4e33de678c7d9c9ffc0a901d9bc9f6a833fccadae407aca31ac56e4a32c5a731"
  },
  "message": "Payment confirmed successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/payment/confirm \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": 1,
    "privateKey": "0x4ccd5866a41cd19eecb34a54ab544c3e20574373ddf8b35eeb1b12e15dbba514"
  }'
```

**Gas Required**: ~80,000 - 120,000 gas

**Smart Contract Event**: `PaymentCompleted(uint256 indexed transactionId, address indexed merchant, uint256 merchantAmount, uint256 platformFee)`

**Notes**:
- Chỉ merchant của transaction mới có thể confirm
- Sau khi confirm, platform fee sẽ được trừ và merchant nhận số tiền còn lại
- Transaction status chuyển từ "Pending" (0) sang "Completed" (1)

---

### 9. Refund Payment
Hoàn tiền cho customer (merchant thực hiện refund).

**Endpoint**: `POST /payment/refund`

**Request Body**:
```json
{
  "transactionId": 1,
  "privateKey": "0xmerchant_private_key"
}
```

**Validation Rules**:
- `transactionId`: Required, positive integer >= 0
- `privateKey`: Required, merchant's private key

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x..."
  },
  "message": "Payment refunded successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/payment/refund \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": 1,
    "privateKey": "0x4ccd5866a41cd19eecb34a54ab544c3e20574373ddf8b35eeb1b12e15dbba514"
  }'
```

**Gas Required**: ~80,000 - 120,000 gas

**Smart Contract Event**: `PaymentRefunded(uint256 indexed transactionId, address indexed merchant, address indexed user, uint256 amount)`

**Notes**:
- Chỉ merchant của transaction mới có thể refund
- Full amount sẽ được hoàn lại cho customer
- Transaction status chuyển sang "Refunded" (2)

---

## Transaction Queries

### 10. Get Transaction Details
Lấy chi tiết của một transaction.

**Endpoint**: `GET /transaction/:id`

**URL Parameters**:
- `id`: Transaction ID (positive integer >= 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": 1,
    "merchant": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
    "user": "0x5bdd48d5014807d1B5bf684eA6F25f404104943F",
    "amount": "10000000000000000",
    "timestamp": 1760377191,
    "paymentMethod": "POS",
    "status": 1,
    "amountFormatted": "0.01 U2U"
  }
}
```

**Transaction Status**:
- `0`: Pending (đang chờ xác nhận)
- `1`: Completed (đã hoàn thành)
- `2`: Refunded (đã hoàn tiền)

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/transaction/1
```

---

### 11. Get User Transactions
Lấy danh sách transaction IDs của user (customer).

**Endpoint**: `GET /user/:address/transactions`

**URL Parameters**:
- `address`: Ethereum address của user

**Response**:
```json
{
  "success": true,
  "data": {
    "userAddress": "0x5bdd48d5014807d1B5bf684eA6F25f404104943F",
    "transactionIds": [1, 3, 5],
    "count": 3
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8080/api/u2u-contract/user/0x5bdd48d5014807d1B5bf684eA6F25f404104943F/transactions
```

---

## Platform Administration

### 12. Update Platform Fee (Admin Only)
Cập nhật phí platform (chỉ owner của contract mới có quyền).

**Endpoint**: `POST /platform/fee`

**Request Body**:
```json
{
  "newFeePercent": 2,
  "ownerPrivateKey": "0xowner_private_key"
}
```

**Validation Rules**:
- `newFeePercent`: Required, integer 0-100 (percentage)
- `ownerPrivateKey`: Required, owner's private key

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0x..."
  },
  "message": "Platform fee updated successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/platform/fee \
  -H 'Content-Type: application/json' \
  -d '{
    "newFeePercent": 2,
    "ownerPrivateKey": "0xowner_private_key_here"
  }'
```

**Gas Required**: ~50,000 - 80,000 gas

**Smart Contract Event**: `PlatformFeeUpdated(uint256 oldFeePercent, uint256 newFeePercent)`

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation error)
- `500`: Internal Server Error (blockchain error, network error)

### Common Errors

#### 1. Validation Errors (400)
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Business name must be between 3 and 100 characters",
      "param": "businessName",
      "location": "body"
    }
  ]
}
```

#### 2. Blockchain Errors (500)
```json
{
  "success": false,
  "error": "Failed to create payment"
}
```

**Common blockchain errors**:
- Insufficient gas
- Insufficient balance
- Transaction reverted
- Invalid merchant address
- Merchant not active
- Transaction not found
- Unauthorized access

#### 3. Network Errors
- RPC connection timeout
- Network unreachable
- Smart contract not responding

---

## Code Examples

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/u2u-contract';

// 1. Register Merchant
async function registerMerchant(businessName: string, privateKey: string) {
  try {
    const response = await axios.post(`${API_BASE}/merchant/register`, {
      businessName,
      privateKey
    });
    console.log('Merchant registered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 2. Create Payment
async function createPayment(
  merchantAddress: string,
  amount: string,
  paymentMethod: 'POS' | 'QR',
  privateKey: string
) {
  try {
    const response = await axios.post(`${API_BASE}/payment/create`, {
      merchantAddress,
      amount,
      paymentMethod,
      privateKey
    });
    console.log('Payment created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 3. Confirm Payment
async function confirmPayment(transactionId: number, privateKey: string) {
  try {
    const response = await axios.post(`${API_BASE}/payment/confirm`, {
      transactionId,
      privateKey
    });
    console.log('Payment confirmed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 4. Get Transaction Details
async function getTransaction(transactionId: number) {
  try {
    const response = await axios.get(`${API_BASE}/transaction/${transactionId}`);
    console.log('Transaction:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// 5. Complete Payment Flow
async function completePaymentFlow() {
  const MERCHANT_KEY = '0x4ccd...';
  const CUSTOMER_KEY = '0xa989...';
  const MERCHANT_ADDRESS = '0x5A460fE9432355Fd723A8D330Af7F8840D88748D';

  // Step 1: Register merchant (if not registered)
  await registerMerchant('My Coffee Shop', MERCHANT_KEY);

  // Step 2: Create payment
  const payment = await createPayment(
    MERCHANT_ADDRESS,
    '0.01',
    'POS',
    CUSTOMER_KEY
  );

  const transactionId = payment.data.transactionId;
  console.log(`Payment created with ID: ${transactionId}`);

  // Step 3: Wait a bit for transaction confirmation
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 4: Confirm payment
  await confirmPayment(transactionId, MERCHANT_KEY);

  // Step 5: Get final transaction state
  const finalTx = await getTransaction(transactionId);
  console.log('Final transaction state:', finalTx);
}
```

### Python Example

```python
import requests
import time

API_BASE = 'http://localhost:8080/api/u2u-contract'

def register_merchant(business_name, private_key):
    """Register a new merchant"""
    url = f'{API_BASE}/merchant/register'
    payload = {
        'businessName': business_name,
        'privateKey': private_key
    }
    response = requests.post(url, json=payload)
    return response.json()

def create_payment(merchant_address, amount, payment_method, private_key):
    """Create a new payment"""
    url = f'{API_BASE}/payment/create'
    payload = {
        'merchantAddress': merchant_address,
        'amount': amount,
        'paymentMethod': payment_method,
        'privateKey': private_key
    }
    response = requests.post(url, json=payload)
    return response.json()

def confirm_payment(transaction_id, private_key):
    """Confirm a payment"""
    url = f'{API_BASE}/payment/confirm'
    payload = {
        'transactionId': transaction_id,
        'privateKey': private_key
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_transaction(transaction_id):
    """Get transaction details"""
    url = f'{API_BASE}/transaction/{transaction_id}'
    response = requests.get(url)
    return response.json()

def get_merchant_info(address):
    """Get merchant information"""
    url = f'{API_BASE}/merchant/{address}'
    response = requests.get(url)
    return response.json()

# Complete payment flow
def complete_payment_flow():
    MERCHANT_KEY = '0x4ccd...'
    CUSTOMER_KEY = '0xa989...'
    MERCHANT_ADDRESS = '0x5A460fE9432355Fd723A8D330Af7F8840D88748D'

    # Register merchant
    print('Registering merchant...')
    register_result = register_merchant('My Coffee Shop', MERCHANT_KEY)
    print(register_result)

    # Create payment
    print('\nCreating payment...')
    payment_result = create_payment(
        MERCHANT_ADDRESS,
        '0.01',
        'POS',
        CUSTOMER_KEY
    )
    transaction_id = payment_result['data']['transactionId']
    print(f'Payment created with ID: {transaction_id}')

    # Wait for confirmation
    time.sleep(3)

    # Confirm payment
    print('\nConfirming payment...')
    confirm_result = confirm_payment(transaction_id, MERCHANT_KEY)
    print(confirm_result)

    # Get final state
    time.sleep(2)
    final_tx = get_transaction(transaction_id)
    print('\nFinal transaction state:')
    print(final_tx)

if __name__ == '__main__':
    complete_payment_flow()
```

### React/Next.js Example

```typescript
// hooks/useU2UContract.ts
import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/u2u-contract';

export function useU2UContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (
    merchantAddress: string,
    amount: string,
    paymentMethod: 'POS' | 'QR',
    privateKey: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/payment/create`, {
        merchantAddress,
        amount,
        paymentMethod,
        privateKey
      });

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create payment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (transactionId: number, privateKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/payment/confirm`, {
        transactionId,
        privateKey
      });

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to confirm payment';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getTransaction = async (transactionId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE}/transaction/${transactionId}`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to get transaction';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    confirmPayment,
    getTransaction,
    loading,
    error
  };
}

// Component example
import { useU2UContract } from '@/hooks/useU2UContract';

export default function PaymentForm() {
  const { createPayment, loading, error } = useU2UContract();
  const [transactionId, setTransactionId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createPayment(
        '0x5A460fE9432355Fd723A8D330Af7F8840D88748D',
        '0.01',
        'POS',
        'your_private_key'
      );

      setTransactionId(result.data.transactionId);
      alert('Payment created successfully!');
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Create Payment'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transactionId && <p>Transaction ID: {transactionId}</p>}
    </form>
  );
}
```

---

## Payment Flow Diagram

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│  Customer   │                │  Merchant   │                │  Platform   │
└──────┬──────┘                └──────┬──────┘                └──────┬──────┘
       │                              │                              │
       │  1. Create Payment           │                              │
       │  (Send U2U tokens)           │                              │
       ├─────────────────────────────>│                              │
       │                              │                              │
       │  2. PaymentInitiated Event   │                              │
       │<─────────────────────────────┤                              │
       │                              │                              │
       │  Status: PENDING             │                              │
       │                              │                              │
       │                              │  3. Confirm Payment          │
       │                              │  (Verify delivery)           │
       │                              ├─────────────────────────────>│
       │                              │                              │
       │                              │  4. Calculate Fee            │
       │                              │  Platform: 1% of amount      │
       │                              │  Merchant: 99% of amount     │
       │                              │<─────────────────────────────┤
       │                              │                              │
       │  5. PaymentCompleted Event   │                              │
       │<─────────────────────────────┤                              │
       │                              │                              │
       │  Status: COMPLETED           │                              │
       │                              │                              │
```

---

## Testing

### Test Script
Sử dụng script có sẵn để test toàn bộ payment flow:

```bash
# Test all endpoints
bash test-u2u-api.sh

# Test complete payment flow
bash test-payment-flow.sh
```

### Manual Testing với cURL

```bash
# 1. Get contract info
curl http://localhost:8080/api/u2u-contract/info | jq .

# 2. Register merchant
curl -X POST http://localhost:8080/api/u2u-contract/merchant/register \
  -H 'Content-Type: application/json' \
  -d '{
    "businessName": "Test Shop",
    "privateKey": "0x..."
  }' | jq .

# 3. Create payment
curl -X POST http://localhost:8080/api/u2u-contract/payment/create \
  -H 'Content-Type: application/json' \
  -d '{
    "merchantAddress": "0x...",
    "amount": "0.01",
    "paymentMethod": "POS",
    "privateKey": "0x..."
  }' | jq .

# 4. Confirm payment
curl -X POST http://localhost:8080/api/u2u-contract/payment/confirm \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": 1,
    "privateKey": "0x..."
  }' | jq .

# 5. Get transaction details
curl http://localhost:8080/api/u2u-contract/transaction/1 | jq .
```

---

## Best Practices

### 1. Security
- ✅ **NEVER** expose private keys in client-side code
- ✅ Store private keys in environment variables
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Add authentication/authorization middleware
- ✅ Validate all input data
- ✅ Use key management services (AWS KMS, HashiCorp Vault)

### 2. Error Handling
- ✅ Always handle blockchain errors gracefully
- ✅ Implement retry logic for network issues
- ✅ Log all errors for debugging
- ✅ Return user-friendly error messages

### 3. Gas Optimization
- ✅ Estimate gas before sending transactions
- ✅ Set appropriate gas limits
- ✅ Monitor gas prices
- ✅ Batch operations when possible

### 4. Transaction Monitoring
- ✅ Store transaction hashes in database
- ✅ Implement webhook for transaction confirmation
- ✅ Monitor transaction status
- ✅ Handle pending transactions

### 5. Performance
- ✅ Use connection pooling for RPC providers
- ✅ Cache frequently accessed data
- ✅ Implement pagination for large result sets
- ✅ Use WebSocket for real-time updates

---

## Troubleshooting

### Issue 1: Transaction Reverted
**Symptom**: Transaction fails with status=0

**Possible causes**:
- Insufficient gas
- Invalid payment method (must be "POS" or "QR")
- Merchant not registered
- Insufficient balance
- Contract validation failed

**Solution**:
- Check gas limit
- Verify payment method
- Ensure merchant is registered
- Check wallet balance

### Issue 2: RPC Connection Error
**Symptom**: "Network Error" or "Connection Timeout"

**Solution**:
- Check RPC URL in `.env`
- Verify network connectivity
- Try alternative RPC endpoints
- Increase timeout settings

### Issue 3: Invalid Private Key
**Symptom**: "Invalid private key format"

**Solution**:
- Ensure private key starts with "0x"
- Verify it's 64 hex characters (not including "0x")
- Check for spaces or special characters

### Issue 4: Merchant Not Found
**Symptom**: "Failed to get merchant information"

**Solution**:
- Verify merchant is registered
- Check merchant address format
- Ensure merchant is active

---

## Support

Để được hỗ trợ:
1. Check logs: `logs/` directory
2. Review error messages
3. Test with script: `test-u2u-api.sh`
4. Check blockchain explorer: https://u2uscan.xyz

---

## Changelog

### Version 1.0.0 (2025-01-14)
- Initial release
- 12 API endpoints
- Complete payment flow
- Merchant management
- Transaction queries
- Platform administration
- Comprehensive documentation

---

## License

MIT License
