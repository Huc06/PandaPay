#!/bin/bash

# Setup Test Account for Payment Testing
# This script creates a test customer account and imports the funded wallet

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
EMAIL="customer@demo.test"
PASSWORD="Demo1234!"
PRIVATE_KEY="0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d"
EXPECTED_ADDRESS="0x5bdd48d5014807d1B5bf684eA6F25f404104943F"

echo "================================================"
echo "🔧 Setting up Test Account"
echo "================================================"
echo ""
echo "Backend: $BACKEND_URL"
echo "Email: $EMAIL"
echo "Expected Wallet: $EXPECTED_ADDRESS"
echo ""

# Step 1: Try to register (might fail if already exists)
echo "================================================"
echo "Step 1: Register Account"
echo "================================================"

REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'",
    "fullName": "Test Customer",
    "phoneNumber": "+84901234567"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "rate limit"; then
    echo ""
    echo "❌ Rate limit active! Please wait 5-10 minutes and try again."
    echo ""
    echo "Run this script again with:"
    echo "  ./setup-test-account.sh"
    exit 1
fi

echo ""
echo "✅ Account created (or already exists)"
echo ""

# Step 2: Login
echo "================================================"
echo "Step 2: Login"
echo "================================================"

LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo ""
    echo "❌ Login failed!"
    ERROR=$(echo "$LOGIN_RESPONSE" | jq -r '.error // .message // "Unknown error"')
    echo "   Error: $ERROR"
    
    if echo "$LOGIN_RESPONSE" | grep -q "rate limit"; then
        echo ""
        echo "⏳ Rate limit active! Please wait and try again."
    fi
    exit 1
fi

echo ""
echo "✅ Login successful"
echo "   Token: ${TOKEN:0:20}..."
echo ""

# Save token
echo "$TOKEN" > /tmp/customer_token.txt

# Step 3: Check if wallet already exists
echo "================================================"
echo "Step 3: Check Existing Wallet"
echo "================================================"

WALLET_INFO=$(curl -s -X GET "$BACKEND_URL/api/evm-wallet/info/u2u" \
  -H "Authorization: Bearer $TOKEN")

echo "$WALLET_INFO" | jq '.' 2>/dev/null || echo "$WALLET_INFO"

EXISTING_ADDRESS=$(echo "$WALLET_INFO" | jq -r '.wallet.address // empty')

if [ "$EXISTING_ADDRESS" = "$EXPECTED_ADDRESS" ]; then
    echo ""
    echo "✅ Wallet already imported!"
    echo "   Address: $EXISTING_ADDRESS"
    
    BALANCE=$(echo "$WALLET_INFO" | jq -r '.wallet.balance // "0"')
    echo "   Balance: $BALANCE U2U"
    echo ""
    echo "================================================"
    echo "✅ Setup Complete!"
    echo "================================================"
    echo ""
    echo "You can now test payments at:"
    echo "  http://localhost:3000/test-payment"
    echo ""
    exit 0
fi

# Step 4: Import wallet
echo ""
echo "================================================"
echo "Step 4: Import Funded Wallet"
echo "================================================"

IMPORT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/evm-wallet/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "'"$PRIVATE_KEY"'",
    "chain": "u2u"
  }')

echo "$IMPORT_RESPONSE" | jq '.' 2>/dev/null || echo "$IMPORT_RESPONSE"

IMPORT_SUCCESS=$(echo "$IMPORT_RESPONSE" | jq -r '.success // false')

if [ "$IMPORT_SUCCESS" != "true" ]; then
    echo ""
    echo "❌ Wallet import failed!"
    ERROR=$(echo "$IMPORT_RESPONSE" | jq -r '.error // .message // "Unknown error"')
    echo "   Error: $ERROR"
    exit 1
fi

echo ""
echo "✅ Wallet imported successfully"
echo ""

# Step 5: Verify wallet
echo "================================================"
echo "Step 5: Verify Wallet"
echo "================================================"

FINAL_WALLET_INFO=$(curl -s -X GET "$BACKEND_URL/api/evm-wallet/info/u2u" \
  -H "Authorization: Bearer $TOKEN")

echo "$FINAL_WALLET_INFO" | jq '.' 2>/dev/null || echo "$FINAL_WALLET_INFO"

FINAL_ADDRESS=$(echo "$FINAL_WALLET_INFO" | jq -r '.wallet.address // empty')
FINAL_BALANCE=$(echo "$FINAL_WALLET_INFO" | jq -r '.wallet.balance // "0"')

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "Account Details:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo "Wallet Details:"
echo "  Address: $FINAL_ADDRESS"
echo "  Balance: $FINAL_BALANCE U2U"
echo "  Chain: U2U Solaris Mainnet"
echo ""
echo "Auth Token saved to: /tmp/customer_token.txt"
echo ""
echo "🎯 Next Steps:"
echo "1. Open test page: http://localhost:3000/test-payment"
echo "2. Page will auto-login with this account"
echo "3. Enter payment amount: 0.01"
echo "4. Click 'Simulate NFC Tap' to test payment"
echo ""
echo "🔗 Resources:"
echo "  - Test Instructions: frontend/TEST_INSTRUCTIONS.md"
echo "  - U2U Explorer: https://u2uscan.xyz"
echo "  - Merchant Address: 0x5A460fE9432355Fd723A8D330Af7F8840D88748D"
echo ""
