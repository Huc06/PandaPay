# 🧪 Test Accounts - PandaPay

## 📋 Tài Khoản Test Đã Sẵn Sàng

---

## 👤 Customer Account (Đã Fund)

### Login Credentials
```
Email:    customer@demo.test
Password: Demo1234!
```

### Wallet Information
```
Address:  0xE2417c9F886bD2A1a093a2549336193DbB6CFa67
Balance:  ~0.039 U2U (đã transfer 0.05 U2U cho merchant)
Chain:    U2U Solaris Mainnet (Chain ID: 39)
```

### Access Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGVlMGIyOGIzYWYwNTU3YmMyMjVjMmYiLCJlbWFpbCI6ImN1c3RvbWVyQGRlbW8udGVzdCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYwNDMwOTI4LCJleHAiOjE3NjA0MzQ1Mjh9.rmtGT1RWp6445v7bYCTCpohKX3S-V8DgyJ8zdHsVY5E
```

**⚠️ Note**: Token expires after 1 hour. Login lại để lấy token mới.

### User ID
```
68ee0b28b3af0557bc225c2f
```

### Test With This Account
- ✅ Login app
- ✅ Scan QR code (merchant payment)
- ✅ Make payment to merchant
- ✅ View transaction history
- ✅ Check balance

---

## 💼 Merchant Account (Đã Sẵn Sàng) ✅

### Login Credentials
```
Email:    merchant006@test.local
Password: Demo1234!
```

### Wallet Information
```
Address:  0x0346225489680F5B7d5752ab92dBcA9510D62eEf
Balance:  0.05 U2U (funded)
Chain:    U2U Solaris Mainnet (Chain ID: 39)
```

### User ID
```
68ee5249422a5ffc588f7e4d
```

### Quick Login (API)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant006@test.local",
    "password": "Demo1234!"
  }'
```

**⚠️ Note**: Token expires after 1 hour. Login lại để lấy token mới.

### Test With Merchant Account
- ✅ Login as merchant
- ✅ Create QR payment request
- ✅ Accept NFC payment
- ✅ View merchant dashboard
- ✅ Check received payments

---

## 🔑 Funded Wallets (Backup)

### Wallet 1 (Customer - Currently Used)
```
Address:      0x5bdd48d5014807d1B5bf684eA6F25f404104943F
Balance:      ~0.39 U2U (đã transfer 0.1 cho customer account)
Private Key:  0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d
```

### Wallet 2 (Merchant - Available)
```
Address:      0x5A460fE9432355Fd723A8D330Af7F8840D88748D
Balance:      0.5 U2U (funded, chưa dùng)
Private Key:  0x5f4da6e4b9b992e02a21f66381f6468cea1b6664ec25518b1fcbcae236bddca8
```

---

## 🧪 Test Scenarios

### Scenario 1: Customer Scans Merchant QR
**Setup**:
1. Login as merchant → Create QR code (amount: 0.01 U2U)
2. Login as customer → Scan QR code
3. Customer confirms payment with PIN
4. Check transaction on U2U Explorer

**Expected**:
- ✅ Payment successful
- ✅ Customer balance decreased
- ✅ Merchant sees pending payment
- ✅ Transaction on blockchain

---

### Scenario 2: NFC Payment at POS Terminal
**Setup**:
1. Login as merchant → Open NFC Terminal
2. Enter amount: 0.01 U2U
3. Click "START NFC PAYMENT"
4. (Simulate) Customer taps NFC card
5. Customer enters PIN → Confirm

**Expected**:
- ✅ Payment processed
- ✅ Transaction hash displayed
- ✅ Link to U2U Explorer

---

### Scenario 3: Direct Test Payment
**Setup**:
1. Open: http://localhost:3000/test-payment
2. Wait for auto-login (should show "Auth: ready")
3. Enter amount: 0.01
4. Click "Manual Test"

**Expected**:
- ✅ Auto-login successful
- ✅ Balance displays correctly
- ✅ Payment processes
- ✅ Explorer link works

---

## 📱 Quick Login Links

### Customer Login
```bash
# Via API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.test",
    "password": "Demo1234!"
  }'
```

### Get Fresh Token
```bash
# Save token to file
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.test","password":"Demo1234!"}' \
  | jq -r '.tokens.accessToken' > /tmp/customer_token.txt

# Use token
TOKEN=$(cat /tmp/customer_token.txt)
echo "Authorization: Bearer $TOKEN"
```

---

## 🔗 Important Links

### Frontend
- **App**: http://localhost:3000
- **Test Payment**: http://localhost:3000/test-payment
- **Merchant Dashboard**: http://localhost:3000/merchant

### Backend
- **API Base**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### Blockchain
- **U2U Explorer**: https://u2uscan.xyz
- **Customer Wallet**: https://u2uscan.xyz/address/0xE2417c9F886bD2A1a093a2549336193DbB6CFa67
- **Merchant Wallet**: https://u2uscan.xyz/address/0x0346225489680F5B7d5752ab92dBcA9510D62eEf
- **Transfer TX**: https://u2uscan.xyz/tx/0x24f4e83b352117390ec57ba3fa9599beee66bb6bc3b6dfb4de0cf8543890ed7c

---

## ⚠️ Important Notes

### Token Expiration
- Access tokens expire after **1 hour**
- Refresh tokens expire after **7 days**
- If token expired, login lại để lấy token mới

### Wallet Balance
- Customer wallet có **~0.039 U2U** (đủ cho ~3 payment tests)
- Merchant wallet có **0.05 U2U** (sẵn sàng nhận payment)
- Nếu hết tiền, có thể transfer từ backup wallet (0x5bdd48...)

### Testing Tips
1. **Check balance trước khi test**:
   ```bash
   curl http://localhost:8080/api/evm-wallet/balance/u2u/0xE2417c9F886bD2A1a093a2549336193DbB6CFa67
   ```

2. **Verify transaction trên Explorer**:
   - Mọi payment đều có TX hash
   - Copy TX hash → Paste vào U2U Explorer
   - Check status: Success ✅

3. **Reset test nếu cần**:
   - Xóa localStorage: `localStorage.clear()`
   - Login lại để lấy token mới
   - Check balance đã đúng chưa

---

## 🆘 Troubleshooting

### "User not authenticated"
→ Token expired hoặc chưa login
→ Login lại để lấy token mới

### "Insufficient balance"
→ Wallet hết tiền
→ Transfer từ wallet khác hoặc dùng funded wallet

### "Invalid merchant address"
→ Merchant address phải đúng format: 0x + 40 hex chars
→ Check lại merchant address trong QR payload

### Payment failed
→ Check backend logs
→ Check merchant đã register trên contract chưa
→ Verify network connection

---

## 📞 Support

Nếu gặp vấn đề:
1. Check backend logs
2. Check browser console (F12)
3. Verify wallet balance
4. Check U2U Explorer

**Happy Testing!** 🚀
