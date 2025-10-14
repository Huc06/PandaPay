import mongoose from 'mongoose';
import { Merchant } from '../src/models/Merchant.model';
import { User } from '../src/models/User.model';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function generateApiKeys() {
  const publicKey = 'pk_' + crypto.randomBytes(16).toString('hex');
  const secretKey = 'sk_' + crypto.randomBytes(32).toString('hex');
  const webhookSecret = 'whsec_' + crypto.randomBytes(24).toString('hex');

  return { publicKey, secretKey, webhookSecret };
}

async function createMerchantRecord() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nfc_payment';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: 'merchant006@test.local' });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ Found user:', {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      evmWalletAddress: user.evmWalletAddress
    });

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ email: user.email });

    if (existingMerchant) {
      console.log('⚠️  Merchant record already exists');
      process.exit(0);
    }

    // Generate API keys
    const apiKeys = generateApiKeys();

    // Create merchant record
    const merchant = new Merchant({
      merchantId: 'MCH_' + crypto.randomBytes(8).toString('hex').toUpperCase(),
      merchantName: user.fullName,
      businessType: 'Retail',
      walletAddress: user.evmWalletAddress || user.walletAddress || 'N/A',
      evmWalletAddress: user.evmWalletAddress,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: {
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Vietnam',
        postalCode: '10000'
      },
      apiKeys,
      isActive: true,
      isVerified: true,
      commission: 2.5,
      settlementPeriod: 'daily'
    });

    await merchant.save();

    console.log('✅ Merchant record created successfully:');
    console.log(JSON.stringify({
      merchantId: merchant.merchantId,
      merchantName: merchant.merchantName,
      email: merchant.email,
      evmWalletAddress: merchant.evmWalletAddress,
      apiKeys: {
        publicKey: apiKeys.publicKey,
        secretKey: apiKeys.secretKey,
        webhookSecret: apiKeys.webhookSecret
      },
      isActive: merchant.isActive,
      isVerified: merchant.isVerified
    }, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMerchantRecord();
