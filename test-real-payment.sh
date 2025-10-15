#!/bin/bash

# Test Real U2U Payment Script
API_URL="http://localhost:8080/api"

echo "🚀 Testing Real U2U Payment..."
echo "================================"

# 1. Login as customer
echo ""
echo "1️⃣ Logging in as customer..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@demo.test",
    "password": "Demo1234!"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."

# 2. Check U2U Wallet
echo ""
echo "2️⃣ Checking U2U wallet..."
WALLET_RESPONSE=$(curl -s -X GET "$API_URL/evm-wallet/info/u2u" \
  -H "Authorization: Bearer $TOKEN")

echo "$WALLET_RESPONSE" | jq '.'

HAS_WALLET=$(echo "$WALLET_RESPONSE" | jq -r '.success')

if [ "$HAS_WALLET" != "true" ]; then
  echo "⚠️ Creating U2U wallet..."
  CREATE_WALLET=$(curl -s -X POST "$API_URL/evm-wallet/create" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"chain": "u2u"}')

  echo "$CREATE_WALLET" | jq '.'

  # Check wallet again
  WALLET_RESPONSE=$(curl -s -X GET "$API_URL/evm-wallet/info/u2u" \
    -H "Authorization: Bearer $TOKEN")
fi

WALLET_ADDRESS=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.address')
BALANCE=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.balance')

echo "✅ Wallet Address: $WALLET_ADDRESS"
echo "✅ Balance: $BALANCE U2U"

# 3. Create Real Payment
echo ""
echo "3️⃣ Creating real payment..."
echo "Merchant: 0x0346225489680F5B7d5752ab92dBcA9510D62eEf"
echo "Amount: 0.01 U2U"

PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/u2u-contract/payment/create-for-user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "0x0346225489680F5B7d5752ab92dBcA9510D62eEf",
    "amount": "0.01",
    "paymentMethod": "QR"
  }')

echo "$PAYMENT_RESPONSE" | jq '.'

SUCCESS=$(echo "$PAYMENT_RESPONSE" | jq -r '.success')
TX_HASH=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.txHash')
TX_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.transactionId')

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "✅✅✅ PAYMENT SUCCESSFUL! ✅✅✅"
  echo "================================"
  echo "Transaction ID: $TX_ID"
  echo "TX Hash: $TX_HASH"
  echo "Explorer: https://u2uscan.xyz/tx/$TX_HASH"
  echo ""
else
  echo ""
  echo "❌ Payment failed!"
  ERROR=$(echo "$PAYMENT_RESPONSE" | jq -r '.error')
  echo "Error: $ERROR"
  echo ""

  # Show more details
  echo "Full response:"
  echo "$PAYMENT_RESPONSE" | jq '.'
fi
