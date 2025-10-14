# 🔧 Test Account Setup Instructions

## Current Status
⚠️ **Backend Rate Limit Active** - Please wait ~5-10 minutes before proceeding

## Account Details
- **Email**: `customer@demo.test`
- **Password**: `Demo1234!`
- **Wallet Address**: `0x5bdd48d5014807d1B5bf684eA6F25f404104943F`
- **Balance**: 0.5 U2U (already funded)

## Setup Steps

### Option 1: Automatic (Recommended)
Once rate limit expires, simply open the test-payment page:
1. Navigate to: http://localhost:3000/test-payment
2. The page will automatically:
   - Login with test credentials
   - Import the funded wallet
   - Display ready status

### Option 2: Manual Setup via Browser

#### Step 1: Wait for Rate Limit
Wait 5-10 minutes after last failed attempt

#### Step 2: Register Account (if needed)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.test",
    "password": "Demo1234!",
    "fullName": "Test Customer",
    "phoneNumber": "+84901234567"
  }'
```

#### Step 3: Login and Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.test",
    "password": "Demo1234!"
  }' | jq -r '.token' > /tmp/customer_token.txt
```

#### Step 4: Import Funded Wallet
```bash
TOKEN=$(cat /tmp/customer_token.txt)

curl -X POST http://localhost:8080/api/evm-wallet/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d",
    "chain": "u2u"
  }'
```

#### Step 5: Verify Wallet
```bash
curl -X GET http://localhost:8080/api/evm-wallet/info/u2u \
  -H "Authorization: Bearer $TOKEN"
```

Expected output:
```json
{
  "success": true,
  "wallet": {
    "address": "0x5bdd48d5014807d1B5bf684eA6F25f404104943F",
    "balance": "0.5",
    "chain": "u2u"
  }
}
```

### Option 3: Manual via Browser UI

#### Step 1: Register
1. Open: http://localhost:3000
2. Click "Register" or "Sign Up"
3. Enter:
   - Email: `customer@demo.test`
   - Password: `Demo1234!`
   - Full Name: `Test Customer`
   - Phone: `+84901234567`
4. Submit registration

#### Step 2: Import Wallet via Console
1. After login, press F12 to open DevTools
2. Go to Console tab
3. Run:
```javascript
// Import funded wallet
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

#### Step 3: Verify
```javascript
// Check wallet info
fetch('http://localhost:8080/api/evm-wallet/info/u2u', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
}).then(r => r.json()).then(console.log);
```

## Testing Payment Flow

Once setup is complete:

1. Open: http://localhost:3000/test-payment
2. Verify status badges show:
   - **Backend**: online ✅
   - **Auth**: ready ✅
   - **Balance**: 0.5 U2U ✅
3. Enter amount: `0.01`
4. Click "Simulate NFC Tap"
5. Payment should process and show transaction hash

## Troubleshooting

### Still Rate Limited?
```bash
# Check if backend restarted
curl http://localhost:8080/health

# Wait longer - rate limit window may be 15-30 minutes
```

### Account Already Exists?
Skip registration, go directly to login

### Wallet Already Imported?
Skip import step, just verify with wallet info endpoint

### Payment Fails?
Check merchant is registered:
```bash
curl http://localhost:8080/api/u2u-contract/merchant/0x5A460fE9432355Fd723A8D330Af7F8840D88748D
```

If not registered, merchant needs to register first.
