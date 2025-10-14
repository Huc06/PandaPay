# 🧪 U2U Contract Payment Testing Guide

## Prerequisites

✅ **Backend is running** (port 8080)
✅ **Test wallets funded with 0.5 U2U each**:
- Merchant: `0x5A460fE9432355Fd723A8D330Af7F8840D88748D`
- Customer: `0x5bdd48d5014807d1B5bf684eA6F25f404104943F`

## Test Scenarios

### 🎯 Scenario 1: API Test (Using curl)

This tests the backend API endpoints directly.

#### Step 1: Get Authentication Token

1. Open the PandaPay app in browser
2. Login with your credentials
3. Open DevTools (F12) > Console
4. Run:
   ```javascript
   localStorage.getItem('authToken')
   ```
5. Copy the token (it will look like a long string of characters)

#### Step 2: Run the Test Script

```bash
cd /home/alvin/PandaPay/frontend

# Set your auth token
export AUTH_TOKEN='paste_your_token_here'

# Optional: Set custom backend URL (default is http://localhost:8080)
export BACKEND_URL='http://localhost:8080'

# Run the test
./test-u2u-payment.sh
```

#### Expected Output:

```
✅ Test Completed!

Summary:
  - Wallet: 0x...
  - Payment Amount: 0.01 U2U
  - Transaction ID: 2
  - TX Hash: 0x...
  - Status: 0 (Pending)
  - Balance Change: ~0.01 U2U

🔗 View on Explorer: https://u2uscan.xyz/tx/0x...
```

---

### 🎯 Scenario 2: Frontend Test (Using test-payment page)

This tests the complete frontend payment flow.

#### Step 1: Ensure User Has U2U Wallet

Before testing, user must have a U2U wallet created:

**Option A: Via API**
```bash
curl -X POST http://localhost:8080/api/evm-wallet/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chain": "u2u"}'
```

**Option B: Via Frontend**
- Navigate to wallet settings
- Click "Create U2U Wallet"
- The wallet will be created and private key stored encrypted on backend

#### Step 2: Access Test Payment Page

1. Open browser: `http://localhost:3000/test-payment`
2. You should see the test payment interface

#### Step 3: Simulate NFC Payment

1. **Set Payment Amount**: Enter `0.01` (in U2U)
2. **Click "Simulate NFC Tap"**: This will bypass actual NFC reading
3. **Payment Processing**: The system will:
   - Use your authenticated session
   - Retrieve your encrypted private key from backend
   - Create U2U Contract payment transaction
   - Display result with transaction ID and explorer link

#### Step 4: Verify Payment

Check the transaction on U2U Explorer:
- Click the "View on Explorer" link
- Or visit: `https://u2uscan.xyz/tx/YOUR_TX_HASH`

---

### 🎯 Scenario 3: QR Payment Test (Using HomeScreen)

This tests QR code payment flow.

#### Step 1: Generate QR Code (Merchant Side)

You need to generate a QR code with this format:

```json
{
  "requestId": "REQ_1234567890",
  "amount": "0.01",
  "merchantAddress": "0x5A460fE9432355Fd723A8D330Af7F8840D88748D",
  "currency": "U2U",
  "paymentMethod": "QR",
  "description": "Test Payment"
}
```

**Generate QR Code Tool**: Use https://www.qr-code-generator.com/
1. Select "Text" type
2. Paste the JSON above
3. Download the QR code image

#### Step 2: Scan QR Code (Customer Side)

1. Open app: `http://localhost:3000` (HomeScreen)
2. Ensure you're logged in
3. Click "Scan QR" or similar payment button
4. Use your phone camera or webcam to scan the QR code
5. Review payment details
6. Enter PIN (optional - kept for UX but not used for signing)
7. Confirm payment

#### Step 3: Verify Payment

- Payment result will show transaction ID
- Check blockchain explorer link
- Balance should be updated

---

## 🔧 Troubleshooting

### Error: "User not authenticated"

**Solution**: You need to login first and get a valid auth token.

```bash
# Login via API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'

# Copy the token from response
export AUTH_TOKEN='token_from_response'
```

### Error: "User does not have a U2U wallet"

**Solution**: Create a U2U wallet first:

```bash
curl -X POST http://localhost:8080/api/evm-wallet/create \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chain": "u2u"}'
```

### Error: "Insufficient balance"

**Solution**: Fund your wallet with U2U tokens. You can:
1. Transfer from test wallets (if you have private keys)
2. Use U2U faucet (if available)
3. Transfer from an exchange

### Error: "Invalid merchant address format"

**Solution**: Ensure merchant address:
- Starts with `0x`
- Is exactly 42 characters (40 hex chars + 0x)
- Example: `0x5A460fE9432355Fd723A8D330Af7F8840D88748D`

### Error: "Transaction reverted"

**Possible causes**:
1. Merchant not registered on contract
2. Insufficient gas
3. Invalid payment method (must be "POS" or "QR")
4. Contract paused or merchant deactivated

**Check merchant registration**:
```bash
curl -X GET "http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D"
```

If merchant is not registered, register first:
```bash
curl -X POST http://localhost:8080/api/u2u-contract/merchant/register-for-user \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test Merchant"}'
```

---

## 📊 Test Checklist

### Pre-Test Setup
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] User account created
- [ ] User logged in
- [ ] Auth token obtained
- [ ] U2U wallet created for user
- [ ] Wallet has sufficient balance (at least 0.02 U2U)
- [ ] Merchant registered on contract

### API Tests
- [ ] Create payment endpoint works
- [ ] Transaction ID is returned
- [ ] TX hash is valid
- [ ] Transaction appears on U2U Explorer
- [ ] Balance decreases by payment amount + gas

### Frontend Tests (test-payment page)
- [ ] Page loads without errors
- [ ] Amount input works
- [ ] Simulate NFC tap works
- [ ] Payment processes successfully
- [ ] Result shows transaction details
- [ ] Explorer link works

### Frontend Tests (HomeScreen QR)
- [ ] QR scanner activates
- [ ] QR code is parsed correctly
- [ ] Payment details display correctly
- [ ] Payment confirmation works
- [ ] Success screen shows transaction info

### Integration Tests
- [ ] End-to-end: Customer creates payment → Merchant confirms
- [ ] Failed payment handling (insufficient balance)
- [ ] Failed payment handling (invalid merchant)
- [ ] Multiple payments in sequence
- [ ] Concurrent payments from different users

---

## 🎯 Success Criteria

A successful test should show:

1. **Transaction Created**: ✅
   - Transaction ID assigned (e.g., 1, 2, 3...)
   - TX hash generated (0x...)
   - Status = 0 (Pending)

2. **Blockchain Confirmed**: ✅
   - Transaction visible on https://u2uscan.xyz
   - From/To addresses correct
   - Amount correct (e.g., 0.01 U2U)

3. **Balance Updated**: ✅
   - Customer wallet decreased by amount + gas
   - Merchant wallet shows pending payment

4. **Merchant Confirmation**: ✅
   - Merchant can confirm transaction
   - Status changes to 1 (Completed)
   - Merchant receives payment minus 1% platform fee

---

## 📞 Support

If tests fail consistently:

1. **Check backend logs**: Look for errors in terminal running backend
2. **Check browser console**: Look for frontend errors
3. **Verify contract address**: Ensure `U2U_CONTRACT_ADDRESS` in `.env` is correct
4. **Check RPC connection**: Ensure `U2U_RPC_URL` is accessible
5. **Verify network**: Ensure on U2U mainnet (Chain ID: 39)

Contract Address: `0xbCB10Bb393215BdC90b7d913604C00A558997cee`
U2U Explorer: https://u2uscan.xyz
RPC URL: https://rpc-mainnet.uniultra.xyz
