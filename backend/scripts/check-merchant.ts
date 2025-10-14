import mongoose from 'mongoose';
import { Merchant } from '../src/models/Merchant.model';
import dotenv from 'dotenv';

dotenv.config();

async function checkMerchant() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nfc_payment';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const merchant = await Merchant.findOne({ email: 'merchant006@test.local' }).select('+apiKeys.secretKey +apiKeys.webhookSecret');

    if (merchant) {
      console.log('✅ Merchant record found:');
      console.log(JSON.stringify({
        merchantId: merchant.merchantId,
        merchantName: merchant.merchantName,
        email: merchant.email,
        walletAddress: merchant.evmWalletAddress || merchant.walletAddress,
        apiKeys: merchant.apiKeys,
        isActive: merchant.isActive,
        isVerified: merchant.isVerified
      }, null, 2));
    } else {
      console.log('❌ No merchant record found for merchant006@test.local');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMerchant();
