# U2U Smart Contract API Guide

API backend để tương tác với U2U Payment Smart Contract tại địa chỉ: `0xbCB10Bb393215BdC90b7d913604C00A558997cee`

## Base URL
```
http://localhost:8080/api/u2u-contract
```

## Endpoints

### 1. Get Contract Info
Lấy thông tin về smart contract

**Endpoint:** `GET /info`

**Response:**
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

### 2. Get Platform Stats
Lấy thống kê của nền tảng

**Endpoint:** `GET /stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "platformFeePercent": 2,
    "totalTransactions": 150,
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

### 3. Register Merchant
Đăng ký merchant mới

**Endpoint:** `POST /merchant/register`

**Request Body:**
```json
{
  "businessName": "Coffee Shop ABC",
  "privateKey": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xabc123...",
    "merchantAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
  },
  "message": "Merchant registered successfully"
}
```

### 4. Get Merchant Info
Lấy thông tin merchant

**Endpoint:** `GET /merchant/:address`

**Example:** `GET /merchant/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4`

**Response:**
```json
{
  "success": true,
  "data": {
    "businessName": "Coffee Shop ABC",
    "isActive": true,
    "totalTransactions": 25,
    "totalRevenue": "1500000000000000000",
    "totalRevenueFormatted": "1.5 U2U"
  }
}
```

### 5. Get Merchant Transactions
Lấy danh sách transaction của merchant

**Endpoint:** `GET /merchant/:address/transactions`

**Example:** `GET /merchant/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4/transactions`

**Response:**
```json
{
  "success": true,
  "data": {
    "merchantAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "transactionIds": [1, 2, 3, 5, 8, 12],
    "count": 6
  }
}
```

### 6. Create Payment
Tạo payment mới

**Endpoint:** `POST /payment/create`

**Request Body:**
```json
{
  "merchantAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
  "amount": "0.5",
  "paymentMethod": "NFC",
  "privateKey": "0x1234567890abcdef..."
}
```

**Payment Methods:** `NFC`, `QR`, `Manual`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xdef456...",
    "transactionId": 15
  },
  "message": "Payment created successfully"
}
```

### 7. Confirm Payment
Xác nhận payment (chỉ merchant)

**Endpoint:** `POST /payment/confirm`

**Request Body:**
```json
{
  "transactionId": 15,
  "privateKey": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xghi789..."
  },
  "message": "Payment confirmed successfully"
}
```

### 8. Refund Payment
Hoàn tiền (chỉ merchant)

**Endpoint:** `POST /payment/refund`

**Request Body:**
```json
{
  "transactionId": 15,
  "privateKey": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xjkl012..."
  },
  "message": "Payment refunded successfully"
}
```

### 9. Get Transaction Details
Lấy chi tiết transaction

**Endpoint:** `GET /transaction/:id`

**Example:** `GET /transaction/15`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 15,
    "merchant": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "user": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "amount": "500000000000000000",
    "amountFormatted": "0.5 U2U",
    "timestamp": 1697234567,
    "paymentMethod": "NFC",
    "status": 1
  }
}
```

**Transaction Status:**
- `0`: Pending
- `1`: Completed
- `2`: Refunded

### 10. Get User Transactions
Lấy danh sách transaction của user

**Endpoint:** `GET /user/:address/transactions`

**Example:** `GET /user/0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199/transactions`

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "transactionIds": [15, 16, 20, 25],
    "count": 4
  }
}
```

### 11. Deactivate Merchant (Admin Only)
Vô hiệu hóa merchant

**Endpoint:** `POST /merchant/:address/deactivate`

**Request Body:**
```json
{
  "ownerPrivateKey": "0x_owner_private_key_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xmno345..."
  },
  "message": "Merchant deactivated successfully"
}
```

### 12. Update Platform Fee (Admin Only)
Cập nhật phí nền tảng

**Endpoint:** `POST /platform/fee`

**Request Body:**
```json
{
  "newFeePercent": 3,
  "ownerPrivateKey": "0x_owner_private_key_..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txHash": "0xpqr678..."
  },
  "message": "Platform fee updated successfully"
}
```

## Error Responses

Khi có lỗi, API sẽ trả về format sau:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error

## Validation Rules

### Private Key Format
- Phải bắt đầu bằng `0x`
- Phải có 64 ký tự hex sau `0x`
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Address Format
- Phải bắt đầu bằng `0x`
- Phải có 40 ký tự hex sau `0x`
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4`

### Amount
- Phải là số thập phân dương
- Đơn vị: U2U tokens
- Example: `0.5`, `1.25`, `10.0`

### Business Name
- Độ dài: 3-100 ký tự
- Required khi đăng ký merchant

### Payment Method
- Chỉ chấp nhận: `NFC`, `QR`, `Manual`

## Testing với cURL

### 1. Get Contract Info
```bash
curl -X GET http://localhost:8080/api/u2u-contract/info
```

### 2. Register Merchant
```bash
curl -X POST http://localhost:8080/api/u2u-contract/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "My Coffee Shop",
    "privateKey": "0x_your_private_key_here"
  }'
```

### 3. Create Payment
```bash
curl -X POST http://localhost:8080/api/u2u-contract/payment/create \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    "amount": "0.5",
    "paymentMethod": "NFC",
    "privateKey": "0x_your_private_key_here"
  }'
```

### 4. Get Transaction Details
```bash
curl -X GET http://localhost:8080/api/u2u-contract/transaction/15
```

## Notes

1. **Private Keys Security**:
   - KHÔNG BAO GIỜ chia sẻ private key
   - Trong production, nên sử dụng wallet signing thay vì gửi private key lên server

2. **Gas Fees**:
   - Tất cả transactions đều cần gas fees (U2U tokens)
   - Đảm bảo wallet có đủ U2U để trả gas

3. **Transaction Confirmation**:
   - Transactions cần thời gian để confirm trên blockchain
   - API sẽ đợi confirmation trước khi return

4. **Rate Limiting**:
   - API có rate limiting để tránh spam
   - Default: 100 requests/phút

## Smart Contract Explorer

Xem contract trên U2U Explorer:
https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee

## Support

Nếu có vấn đề, vui lòng liên hệ team development.
