/**
 * Migration script to update existing users with 'user' role to 'visitor' role
 * This is needed after changing the role enum from ['user', 'admin'] to ['visitor', 'creator', 'admin']
 * 
 * Usage: node backend/scripts/migrateUserRole.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const migrateUserRoles = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with the old 'user' role
    const usersToUpdate = await User.find({ role: 'user' }).select('name email');
    console.log(`Found ${usersToUpdate.length} users with 'user' role to migrate\n`);

    if (usersToUpdate.length === 0) {
      console.log('✅ No users need to be migrated. All users already have valid roles.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Show some example users that will be updated
    if (usersToUpdate.length > 0) {
      console.log('Users to be migrated:');
      usersToUpdate.slice(0, 5).forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
      if (usersToUpdate.length > 5) {
        console.log(`   ... and ${usersToUpdate.length - 5} more`);
      }
      console.log();
    }

    // Use updateMany for efficient bulk update
    const result = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'visitor' } }
    );

    console.log(`📊 Migration Summary:`);
    console.log(`   - Users found with 'user' role: ${usersToUpdate.length}`);
    console.log(`   - Successfully updated: ${result.modifiedCount}`);
    console.log(`   - Users matched: ${result.matchedCount}\n`);

    // Verify the migration
    const remainingUsers = await User.find({ role: 'user' });
    if (remainingUsers.length === 0) {
      console.log('✅ Migration completed successfully! All users have been updated to valid roles.');
    } else {
      console.log(`⚠️  Warning: ${remainingUsers.length} users still have 'user' role. Please review manually.`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
migrateUserRoles();

