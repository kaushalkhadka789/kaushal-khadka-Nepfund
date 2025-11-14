/**
 * Migration script to recalculate reward points for all users
 * Run this script if reward points are missing or incorrect
 * 
 * Usage: node backend/scripts/recalculateRewardPoints.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import RewardTransaction from '../models/RewardTransaction.model.js';
import { calculatePoints } from '../utils/reward.utils.js';

dotenv.config();

const recalculateRewardPoints = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lordqshal_db_user:0Et9DAvWt6kHTGJ9@cluster0.crf46gj.mongodb.net/nepfund');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get all completed donations for this user
        const donations = await Donation.find({
          donor: user._id,
          status: 'completed'
        });

        // Calculate total points from all donations
        let totalPoints = 0;
        for (const donation of donations) {
          const points = calculatePoints(donation.amount);
          totalPoints += points;
        }

        // Update user's reward points
        await User.findByIdAndUpdate(user._id, {
          rewardPoints: totalPoints
        });

        console.log(`Updated user ${user.name} (${user.email}): ${totalPoints} points from ${donations.length} donations`);
        updatedCount++;
      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nRecalculation complete!`);
    console.log(`- Updated: ${updatedCount} users`);
    console.log(`- Errors: ${errorCount} users`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
recalculateRewardPoints();

