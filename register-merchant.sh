#!/bin/bash

# Register Merchant on U2U Smart Contract
API_URL="http://localhost:8080/api"

echo "🏪 Registering Merchant on U2U Smart Contract..."
echo "================================================"

# Login as merchant
echo ""
echo "1️⃣ Logging in as merchant..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant006@test.local",
    "password": "Demo1234!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Login successful!"

# Check/Create Merchant Wallet
echo ""
echo "2️⃣ Checking merchant U2U wallet..."
WALLET_RESPONSE=$(curl -s -X GET "$API_URL/evm-wallet/info/u2u" \
  -H "Authorization: Bearer $TOKEN")

HAS_WALLET=$(echo "$WALLET_RESPONSE" | jq -r '.success')

if [ "$HAS_WALLET" != "true" ]; then
  echo "⚠️ Creating U2U wallet for merchant..."
  CREATE_WALLET=$(curl -s -X POST "$API_URL/evm-wallet/create" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"chain": "u2u"}')

  echo "$CREATE_WALLET" | jq '.'

  # Check wallet again
  WALLET_RESPONSE=$(curl -s -X GET "$API_URL/evm-wallet/info/u2u" \
    -H "Authorization: Bearer $TOKEN")
fi

MERCHANT_ADDRESS=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.address')
BALANCE=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.balance')

echo "✅ Merchant Address: $MERCHANT_ADDRESS"
echo "✅ Balance: $BALANCE U2U"

# Register Merchant on Smart Contract
echo ""
echo "3️⃣ Registering merchant on U2U Smart Contract..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/u2u-contract/merchant/register-for-user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Merchant Shop"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success')
TX_HASH=$(echo "$REGISTER_RESPONSE" | jq -r '.data.txHash')

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "✅✅✅ MERCHANT REGISTERED! ✅✅✅"
  echo "================================"
  echo "Merchant Address: $MERCHANT_ADDRESS"
  echo "TX Hash: $TX_HASH"
  echo "Explorer: https://u2uscan.xyz/tx/$TX_HASH"
  echo ""
  echo "Now you can accept payments at this address!"
  echo ""

  # Update test script with new merchant address
  echo "📝 Updating test-real-payment.sh with correct merchant address..."
  sed -i "s|0x0346225489680F5B7d5752ab92dBcA9510D62eEf|$MERCHANT_ADDRESS|g" test-real-payment.sh
  echo "✅ Updated!"
else
  echo ""
  echo "❌ Registration failed!"
  ERROR=$(echo "$REGISTER_RESPONSE" | jq -r '.error')
  echo "Error: $ERROR"
fi
