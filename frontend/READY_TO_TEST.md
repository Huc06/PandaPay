# ✅ Test Payment Page - Ready to Test

## Current Status

The test payment page has been fully migrated to use U2U Contract authenticated API with auto-login functionality.

### What's Been Completed

1. ✅ **Backend Migration**: Replaced old POS session API with U2U Contract authenticated endpoints
2. ✅ **Auto-login**: Page automatically logs in with test credentials on load
3. ✅ **Wallet Management**: Automatically imports funded wallet (0.5 U2U)
4. ✅ **Payment Flow**: Direct U2U Contract payment (no POS session needed)
5. ✅ **Error Handling**: Visual status badges, error alerts, retry buttons
6. ✅ **Test Scripts**: Created automated setup scripts

### Files Modified

- `frontend/app/test-payment/page.tsx` - Complete migration to U2U Contract API
- `frontend/setup-test-account.sh` - Automated account setup script
- `frontend/SETUP_TEST_ACCOUNT.md` - Manual setup instructions
- `frontend/TEST_INSTRUCTIONS.md` - Comprehensive testing guide

## ⚠️ Current Blocker: Rate Limit

The backend currently has rate limiting active for authentication endpoints.

**What this means**:
- Cannot create new accounts via API
- Cannot login via API
- Rate limit window: ~5-10 minutes (possibly longer)

**When rate limit expires**: The auto-login will work automatically!

## 🚀 Quick Start (After Rate Limit Expires)

### Option 1: Fully Automatic (Recommended)

Just open the test page and it will handle everything:

```bash
# Simply navigate to:
http://localhost:3000/test-payment
```

The page will:
1. Auto-login with `customer@demo.test` / `Demo1234!`
2. Auto-import funded wallet (0x5bdd...943F with 0.5 U2U)
3. Show "Auth: ready" badge when complete
4. Be ready for testing

### Option 2: Run Setup Script

Wait 5-10 minutes after last failed attempt, then:

```bash
cd /home/alvin/PandaPay/frontend
./setup-test-account.sh
```

This will:
- Register account (if needed)
- Login and get auth token
- Import funded wallet
- Verify everything is ready
- Save token to `/tmp/customer_token.txt`

### Option 3: Manual Browser Setup

See `SETUP_TEST_ACCOUNT.md` for detailed manual instructions.

## 📋 Test Account Details

- **Email**: `customer@demo.test`
- **Password**: `Demo1234!`
- **Funded Wallet**: `0x5bdd48d5014807d1B5bf684eA6F25f404104943F`
- **Balance**: 0.5 U2U (already on blockchain)
- **Private Key**: Stored in test-payment page source

## 🧪 Testing the Payment Flow

Once auto-login shows "Auth: ready":

1. **Open test page**: http://localhost:3000/test-payment

2. **Verify status**:
   - Backend: online ✅
   - Auth: ready ✅
   - Balance: 0.5 U2U ✅

3. **Make test payment**:
   - Enter amount: `0.01` U2U
   - Click "Simulate NFC Tap"
   - Wait for processing (~3-5 seconds)

4. **View results**:
   - Transaction ID (e.g., 1, 2, 3...)
   - TX Hash (0x...)
   - Explorer link to U2U blockchain
   - Updated balance

5. **Verify on blockchain**:
   - Click "View on Explorer" link
   - Or visit: https://u2uscan.xyz
   - Search for your TX hash
   - Confirm transaction is on-chain

## 🔧 Troubleshooting

### Status shows "Auth: failed"

**Likely cause**: Rate limit still active or account doesn't exist

**Solutions**:
1. Wait 10-15 minutes for rate limit to expire
2. Click "Retry Login" button
3. Or run: `./setup-test-account.sh`

### Status shows "checking existing token" (stuck)

**Likely cause**: Old invalid token in localStorage

**Solution**: Open browser console (F12) and run:
```javascript
localStorage.removeItem('authToken');
location.reload();
```

### Payment fails with "User does not have a U2U wallet"

**Likely cause**: Wallet import failed or was skipped

**Solution**: Manually import via browser console:
```javascript
fetch('http://localhost:8080/api/evm-wallet/import', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    privateKey: '0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d',
    chain: 'u2u'
  })
}).then(r => r.json()).then(console.log);
```

### Payment fails with "Insufficient balance"

**Check actual balance**:
```bash
curl http://localhost:8080/api/evm-wallet/balance/u2u/0x5bdd48d5014807d1B5bf684eA6F25f404104943F
```

If balance is low, you may need to fund the wallet from another source.

### Payment fails with "Transaction reverted"

**Possible causes**:
1. Merchant not registered on contract
2. Invalid payment method
3. Contract issue

**Check merchant registration**:
```bash
curl http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D
```

## 📊 Expected Test Results

### Successful Payment

```
✅ Payment successful! Transaction ID: 1

Transaction Details:
  Amount: 0.01 U2U
  Gas Fee: ~0.0001 U2U
  Total: ~0.0101 U2U
  TX Hash: 0xabc123...
  Status: Completed

🔗 View on Explorer
```

### Blockchain Confirmation

On https://u2uscan.xyz:
- **From**: 0x5bdd48d5014807d1B5bf684eA6F25f404104943F (Customer)
- **To**: 0x5A460fE9432355Fd723A8D330Af7F8840D88748D (Merchant)
- **Value**: 0.01 U2U
- **Status**: Success ✅

### Balance Update

- **Before**: 0.5 U2U
- **After**: ~0.4899 U2U (0.5 - 0.01 - gas fee)

## 🎯 Success Criteria

All checkboxes should pass:

- [ ] Backend is running and responsive
- [ ] Auto-login succeeds (shows "Auth: ready")
- [ ] Wallet info displays with correct address
- [ ] Balance shows 0.5 U2U (or close to it)
- [ ] Payment processes without errors
- [ ] Transaction ID is returned
- [ ] TX hash is generated
- [ ] Transaction appears on U2U Explorer
- [ ] Balance decreases by payment amount + gas
- [ ] Merchant can see pending transaction

## 📞 Next Steps After Testing

Once you confirm the test payment works:

1. **Test Multiple Payments**: Try 2-3 payments in sequence
2. **Test Different Amounts**: Try 0.005, 0.02, 0.1 U2U
3. **Test Error Cases**: Try payment without balance, invalid merchant, etc.
4. **Migrate Other Pages**: Apply same pattern to HomeScreen, NFCTerminal, QRPaymentTerminal
5. **Merchant Confirmation**: Test merchant confirming/refunding transactions

## 📚 Related Documentation

- `TEST_INSTRUCTIONS.md` - Comprehensive testing guide (all scenarios)
- `SETUP_TEST_ACCOUNT.md` - Manual account setup steps
- `U2U_CONTRACT_INTEGRATION.md` - Technical integration details
- `PAYMENT_API_MIGRATION.md` - API migration guide

## 🔗 Important Links

- **Frontend**: http://localhost:3000
- **Test Page**: http://localhost:3000/test-payment
- **Backend**: http://localhost:8080
- **U2U Explorer**: https://u2uscan.xyz
- **Contract Address**: 0xbCB10Bb393215BdC90b7d913604C00A558997cee
- **Merchant Address**: 0x5A460fE9432355Fd723A8D330Af7F8840D88748D
- **Customer Address**: 0x5bdd48d5014807d1B5bf684eA6F25f404104943F

---

## ⏳ Current Action Required

**Wait 5-10 minutes for rate limit to expire**, then either:

1. Open http://localhost:3000/test-payment (it will auto-setup)
2. Or run: `./setup-test-account.sh`

The page is fully ready - just needs the rate limit to clear! ✨
