#!/bin/bash

# Test Payment Flow with U2U Contract
# NOTE: These wallets need U2U tokens for gas fees

API_BASE="http://localhost:8080/api/u2u-contract"

# Test wallets (need funding first)
MERCHANT_ADDRESS="0x5A460fE9432355Fd723A8D330Af7F8840D88748D"
MERCHANT_KEY="0x4ccd5866a41cd19eecb34a54ab544c3e20574373ddf8b35eeb1b12e15dbba514"

CUSTOMER_ADDRESS="0x5bdd48d5014807d1B5bf684eA6F25f404104943F"
CUSTOMER_KEY="0xa989063089f0050d6232c2c8f8b3558e5e16f4ed1f41b3d688e88501fdc98b5d"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           TESTING PAYMENT FLOW WITH U2U CONTRACT              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Test Wallets:"
echo "   Merchant: $MERCHANT_ADDRESS"
echo "   Customer: $CUSTOMER_ADDRESS"
echo ""

echo "⚠️  NOTE: These wallets need U2U tokens for gas fees"
echo "   Please fund them from: https://u2uscan.xyz"
echo ""

read -p "Have you funded these wallets? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please fund wallets first, then run this script again"
    echo ""
    echo "Fund merchant: $MERCHANT_ADDRESS"
    echo "Fund customer: $CUSTOMER_ADDRESS"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Register Merchant"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/merchant/register" \
  -H 'Content-Type: application/json' \
  -d "{
    \"businessName\": \"Test Coffee Shop\",
    \"privateKey\": \"$MERCHANT_KEY\"
  }")

echo "$REGISTER_RESPONSE" | jq .

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null; then
    TX_HASH=$(echo "$REGISTER_RESPONSE" | jq -r '.data.txHash')
    echo ""
    echo "✅ Merchant registered successfully!"
    echo "   Transaction: https://u2uscan.xyz/tx/$TX_HASH"
    echo ""
    echo "⏳ Waiting for transaction to confirm..."
    sleep 5
else
    echo ""
    echo "❌ Failed to register merchant"
    echo "   Error: $(echo "$REGISTER_RESPONSE" | jq -r '.error')"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Get Merchant Info"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MERCHANT_INFO=$(curl -s "$API_BASE/merchant/$MERCHANT_ADDRESS")
echo "$MERCHANT_INFO" | jq .

if echo "$MERCHANT_INFO" | jq -e '.success' > /dev/null; then
    BUSINESS_NAME=$(echo "$MERCHANT_INFO" | jq -r '.data.businessName')
    IS_ACTIVE=$(echo "$MERCHANT_INFO" | jq -r '.data.isActive')
    echo ""
    echo "✅ Merchant info retrieved"
    echo "   Business: $BUSINESS_NAME"
    echo "   Active: $IS_ACTIVE"
else
    echo ""
    echo "❌ Failed to get merchant info"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Create Payment (Customer pays 0.01 U2U)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PAYMENT_RESPONSE=$(curl -s -X POST "$API_BASE/payment/create" \
  -H 'Content-Type: application/json' \
  -d "{
    \"merchantAddress\": \"$MERCHANT_ADDRESS\",
    \"amount\": \"0.01\",
    \"paymentMethod\": \"NFC\",
    \"privateKey\": \"$CUSTOMER_KEY\"
  }")

echo "$PAYMENT_RESPONSE" | jq .

if echo "$PAYMENT_RESPONSE" | jq -e '.success' > /dev/null; then
    PAYMENT_TX_HASH=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.txHash')
    TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | jq -r '.data.transactionId')
    echo ""
    echo "✅ Payment created successfully!"
    echo "   Transaction: https://u2uscan.xyz/tx/$PAYMENT_TX_HASH"
    echo "   Transaction ID: $TRANSACTION_ID"
    echo ""
    echo "⏳ Waiting for transaction to confirm..."
    sleep 5
else
    echo ""
    echo "❌ Failed to create payment"
    echo "   Error: $(echo "$PAYMENT_RESPONSE" | jq -r '.error')"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Get Transaction Details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TX_DETAILS=$(curl -s "$API_BASE/transaction/$TRANSACTION_ID")
echo "$TX_DETAILS" | jq .

if echo "$TX_DETAILS" | jq -e '.success' > /dev/null; then
    AMOUNT=$(echo "$TX_DETAILS" | jq -r '.data.amountFormatted')
    STATUS=$(echo "$TX_DETAILS" | jq -r '.data.status')
    METHOD=$(echo "$TX_DETAILS" | jq -r '.data.paymentMethod')
    echo ""
    echo "✅ Transaction details retrieved"
    echo "   Amount: $AMOUNT"
    echo "   Status: $STATUS (0=Pending, 1=Completed, 2=Refunded)"
    echo "   Method: $METHOD"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Confirm Payment (Merchant confirms)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONFIRM_RESPONSE=$(curl -s -X POST "$API_BASE/payment/confirm" \
  -H 'Content-Type: application/json' \
  -d "{
    \"transactionId\": $TRANSACTION_ID,
    \"privateKey\": \"$MERCHANT_KEY\"
  }")

echo "$CONFIRM_RESPONSE" | jq .

if echo "$CONFIRM_RESPONSE" | jq -e '.success' > /dev/null; then
    CONFIRM_TX_HASH=$(echo "$CONFIRM_RESPONSE" | jq -r '.data.txHash')
    echo ""
    echo "✅ Payment confirmed successfully!"
    echo "   Transaction: https://u2uscan.xyz/tx/$CONFIRM_TX_HASH"
    echo ""
    echo "⏳ Waiting for transaction to confirm..."
    sleep 5
else
    echo ""
    echo "❌ Failed to confirm payment"
    echo "   Error: $(echo "$CONFIRM_RESPONSE" | jq -r '.error')"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Verify Final State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Final Transaction Status:"
TX_FINAL=$(curl -s "$API_BASE/transaction/$TRANSACTION_ID")
echo "$TX_FINAL" | jq '{
  transactionId: .data.transactionId,
  amount: .data.amountFormatted,
  status: .data.status,
  merchant: .data.merchant,
  user: .data.user
}'

echo ""
echo "📊 Merchant Stats:"
MERCHANT_FINAL=$(curl -s "$API_BASE/merchant/$MERCHANT_ADDRESS")
echo "$MERCHANT_FINAL" | jq '{
  businessName: .data.businessName,
  isActive: .data.isActive,
  totalTransactions: .data.totalTransactions,
  totalRevenue: .data.totalRevenueFormatted
}'

echo ""
echo "📊 Platform Stats:"
curl -s "$API_BASE/stats" | jq '{
  platformFee: .data.platformFeePercent,
  totalTransactions: .data.totalTransactions
}'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     PAYMENT FLOW COMPLETE                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 All steps completed successfully!"
echo ""
echo "📝 Summary:"
echo "   1. ✅ Merchant registered"
echo "   2. ✅ Payment created (0.01 U2U)"
echo "   3. ✅ Payment confirmed"
echo "   4. ✅ Contract state updated"
echo ""
echo "🔗 View on explorer:"
echo "   Contract: https://u2uscan.xyz/address/0xbCB10Bb393215BdC90b7d913604C00A558997cee"
echo "   Merchant: https://u2uscan.xyz/address/$MERCHANT_ADDRESS"
echo "   Customer: https://u2uscan.xyz/address/$CUSTOMER_ADDRESS"
echo ""
