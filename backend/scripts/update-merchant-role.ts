import mongoose from 'mongoose';
import { User } from '../src/models/User.model';
import dotenv from 'dotenv';

dotenv.config();

async function updateRole() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nfc_payment';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'merchant006@test.local' },
      { role: 'merchant' },
      { new: true }
    );

    if (user) {
      console.log('✅ Updated user role:');
      console.log(JSON.stringify({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }, null, 2));
    } else {
      console.log('❌ User not found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateRole();
