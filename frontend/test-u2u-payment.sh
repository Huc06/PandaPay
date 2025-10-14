#!/bin/bash

# Test U2U Contract Payment Flow
# Requires: User must be authenticated and have a U2U wallet

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "================================================"
echo "🧪 U2U Contract Payment Flow Test"
echo "================================================"
echo ""

# Test wallet addresses
MERCHANT_ADDRESS="0x5A460fE9432355Fd723A8D330Af7F8840D88748D"
CUSTOMER_ADDRESS="0x5bdd48d5014807d1B5bf684eA6F25f404104943F"

echo "📋 Test Configuration:"
echo "   Backend URL: $BACKEND_URL"
echo "   Merchant Address: $MERCHANT_ADDRESS"
echo "   Customer Address: $CUSTOMER_ADDRESS"
echo ""

# Check if AUTH_TOKEN is set
if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ ERROR: AUTH_TOKEN environment variable not set!"
    echo ""
    echo "To get your auth token:"
    echo "1. Login to the app"
    echo "2. Open browser DevTools > Console"
    echo "3. Run: localStorage.getItem('authToken')"
    echo "4. Export it: export AUTH_TOKEN='your_token_here'"
    echo ""
    exit 1
fi

echo "✅ Auth token found"
echo ""

# Step 1: Check if user has U2U wallet
echo "================================================"
echo "Step 1: Check User Wallet"
echo "================================================"
WALLET_INFO=$(curl -s -X GET \
  "$BACKEND_URL/api/evm-wallet/info/u2u" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

echo "$WALLET_INFO" | jq '.'

WALLET_ADDRESS=$(echo "$WALLET_INFO" | jq -r '.wallet.address // empty')

if [ -z "$WALLET_ADDRESS" ]; then
    echo ""
    echo "❌ User does not have a U2U wallet!"
    echo "Creating wallet..."

    CREATE_WALLET=$(curl -s -X POST \
      "$BACKEND_URL/api/evm-wallet/create" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"chain": "u2u"}')

    echo "$CREATE_WALLET" | jq '.'
    WALLET_ADDRESS=$(echo "$CREATE_WALLET" | jq -r '.wallet.address // empty')
fi

echo ""
echo "✅ User wallet address: $WALLET_ADDRESS"
echo ""

# Step 2: Check wallet balance
echo "================================================"
echo "Step 2: Check Wallet Balance"
echo "================================================"
BALANCE=$(curl -s -X GET \
  "$BACKEND_URL/api/evm-wallet/balance/u2u/$WALLET_ADDRESS" \
  -H "Content-Type: application/json")

echo "$BALANCE" | jq '.'
BALANCE_U2U=$(echo "$BALANCE" | jq -r '.balance // "0"')

echo ""
echo "💰 Current Balance: $BALANCE_U2U U2U"
echo ""

if (( $(echo "$BALANCE_U2U < 0.01" | bc -l) )); then
    echo "⚠️  WARNING: Wallet balance is low!"
    echo "   Please fund the wallet: $WALLET_ADDRESS"
    echo "   You can send U2U from the test wallets"
    echo ""
fi

# Step 3: Create payment (Customer creates payment)
echo "================================================"
echo "Step 3: Create Payment (Customer → Merchant)"
echo "================================================"
AMOUNT="0.01"

echo "Creating payment of $AMOUNT U2U to merchant $MERCHANT_ADDRESS"
echo ""

PAYMENT_RESPONSE=$(curl -s -X POST \
  "$BACKEND_URL/api/u2u-contract/payment/create-for-user" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "'"$MERCHANT_ADDRESS"'",
    "amount": "'"$AMOUNT"'",
    "paymentMethod": "POS"
  }')

echo "$PAYMENT_RESPONSE" | jq '.'

SUCCESS=$(echo "$PAYMENT_RESPONSE" | jq -r '.success')
TX_HASH=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.txHash // empty')
TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.transactionId // empty')

if [ "$SUCCESS" != "true" ]; then
    echo ""
    echo "❌ Payment creation failed!"
    ERROR=$(echo "$PAYMENT_RESPONSE" | jq -r '.error // .message // "Unknown error"')
    echo "   Error: $ERROR"
    exit 1
fi

echo ""
echo "✅ Payment Created Successfully!"
echo "   Transaction Hash: $TX_HASH"
echo "   Transaction ID: $TRANSACTION_ID"
echo "   Explorer: https://u2uscan.xyz/tx/$TX_HASH"
echo ""

# Step 4: Get transaction details
echo "================================================"
echo "Step 4: Get Transaction Details"
echo "================================================"

sleep 3  # Wait for blockchain confirmation

TRANSACTION_DETAILS=$(curl -s -X GET \
  "$BACKEND_URL/api/u2u-contract/transaction/$TRANSACTION_ID" \
  -H "Content-Type: application/json")

echo "$TRANSACTION_DETAILS" | jq '.'

STATUS=$(echo "$TRANSACTION_DETAILS" | jq -r '.data.status')
echo ""
echo "📊 Transaction Status: $STATUS (0=Pending, 1=Completed, 2=Refunded)"
echo ""

# Step 5: Check updated balance
echo "================================================"
echo "Step 5: Check Updated Balance"
echo "================================================"

NEW_BALANCE=$(curl -s -X GET \
  "$BACKEND_URL/api/evm-wallet/balance/u2u/$WALLET_ADDRESS" \
  -H "Content-Type: application/json")

NEW_BALANCE_U2U=$(echo "$NEW_BALANCE" | jq -r '.balance // "0"')

echo "💰 New Balance: $NEW_BALANCE_U2U U2U"
echo "   Previous: $BALANCE_U2U U2U"
echo "   Difference: $(echo "$BALANCE_U2U - $NEW_BALANCE_U2U" | bc) U2U"
echo ""

echo "================================================"
echo "✅ Test Completed!"
echo "================================================"
echo ""
echo "Summary:"
echo "  - Wallet: $WALLET_ADDRESS"
echo "  - Payment Amount: $AMOUNT U2U"
echo "  - Transaction ID: $TRANSACTION_ID"
echo "  - TX Hash: $TX_HASH"
echo "  - Status: $STATUS"
echo "  - Balance Change: $(echo "$BALANCE_U2U - $NEW_BALANCE_U2U" | bc) U2U"
echo ""
echo "🔗 View on Explorer: https://u2uscan.xyz/tx/$TX_HASH"
echo ""
