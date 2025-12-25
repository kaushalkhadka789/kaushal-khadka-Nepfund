import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

// Load environment variables
dotenv.config();

const makeUserAdmin = async (email) => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('MongoDB connected successfully');

    // Find user by email and update role to admin
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log('✅ User successfully updated to admin:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js lamine10@gmail.com');
  process.exit(1);
}

makeUserAdmin(email);
