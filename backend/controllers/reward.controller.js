import User from '../models/User.model.js';
import RewardTransaction from '../models/RewardTransaction.model.js';
import Donation from '../models/Donation.model.js';
import { getTier, getTierProgress, REWARD_CONFIG } from '../utils/reward.utils.js';

// @desc    Get user's reward information
// @route   GET /api/rewards/me
// @access  Private
export const getMyRewards = async (req, res) => {
  try {
    // Fetch user from database with explicit field selection
    const user = await User.findById(req.user.id).select('rewardPoints totalDonated');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure rewardPoints is a number (handle null/undefined)
    const points = typeof user.rewardPoints === 'number' ? user.rewardPoints : 0;
    const currentTier = getTier(points);
    const tierProgress = getTierProgress(points);

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalTransactions = await RewardTransaction.countDocuments({ userId: req.user.id });

    // Get recent reward transactions from database with pagination
    const recentTransactions = await RewardTransaction.find({ userId: req.user.id })
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get total donations count from database
    const totalDonations = await Donation.countDocuments({ 
      donor: req.user.id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        points,
        tier: {
          name: currentTier.name,
          color: currentTier.color,
          icon: currentTier.icon,
          minPoints: currentTier.minPoints,
          maxPoints: currentTier.maxPoints
        },
        tierProgress,
        totalDonations,
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          campaignTitle: tx.campaignId?.title || 'Campaign Deleted',
          donationAmount: tx.donationAmount,
          pointsEarned: tx.pointsEarned,
          bonusPoints: tx.bonusPoints,
          reason: tx.reason,
          createdAt: tx.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top donors leaderboard
// @route   GET /api/rewards/top
// @access  Public
export const getTopDonors = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 50, 100);

    // Get top users by reward points
    const topUsers = await User.find({ rewardPoints: { $gt: 0 } })
      .select('name email avatar rewardPoints totalDonated')
      .sort({ rewardPoints: -1 })
      .limit(numericLimit);

    // Get donation counts for each user
    const userIds = topUsers.map(user => user._id);
    const donationCounts = await Donation.aggregate([
      {
        $match: {
          donor: { $in: userIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$donor',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of donation counts
    const donationCountMap = {};
    donationCounts.forEach(item => {
      donationCountMap[item._id.toString()] = item.count;
    });

    // Format leaderboard data
    const leaderboard = topUsers.map((user, index) => {
      const tier = getTier(user.rewardPoints || 0);
      return {
        rank: index + 1,
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || user.profileImage,
        points: user.rewardPoints || 0,
        totalDonated: user.totalDonated || 0,
        totalDonations: donationCountMap[user._id.toString()] || 0,
        tier: {
          name: tier.name,
          color: tier.color,
          icon: tier.icon
        }
      };
    });

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin: Grant bonus points to user
// @route   POST /api/rewards/admin/grant-points
// @access  Private (Admin)
export const grantBonusPoints = async (req, res) => {
  try {
    const { userId, points, reason, notes } = req.body;

    if (!userId || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'User ID and positive points amount are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's reward points atomically
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { rewardPoints: points } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update'
      });
    }

    // Create reward transaction record
    await RewardTransaction.create({
      userId,
      campaignId: null, // Bonus points may not be tied to a campaign
      donationId: null,
      donationAmount: 0,
      pointsEarned: 0,
      bonusPoints: points,
      reason: 'bonus',
      notes: notes || `Admin granted ${points} bonus points. ${reason || ''}`
    });

    const tier = getTier(updatedUser.rewardPoints || 0);

    res.status(200).json({
      success: true,
      data: {
        userId: updatedUser._id,
        pointsAdded: points,
        totalPoints: updatedUser.rewardPoints || 0,
        tier: {
          name: tier.name,
          color: tier.color,
          icon: tier.icon
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin: Update reward point rules
// @route   PUT /api/rewards/admin/config
// @access  Private (Admin)
export const updateRewardConfig = async (req, res) => {
  try {
    // For now, return the current config
    // In production, you might want to store this in a database
    res.status(200).json({
      success: true,
      message: 'Reward config update endpoint. Configuration is currently in code.',
      config: {
        pointsPerNPR: REWARD_CONFIG.POINTS_PER_NPR,
        tiers: REWARD_CONFIG.TIERS
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get monthly donation trends for chart
// @route   GET /api/rewards/trends
// @access  Public
export const getDonationTrends = async (req, res) => {
  try {
    // 1. Aggregate completed donations grouped by month
    const trends = await Donation.aggregate([
      {
        // Only include completed donations
        $match: { status: 'completed' } 
      },
      {
        // Group by month of the 'createdAt' field
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: "$amount" }
        }
      },
      { 
        // Sort from January (1) to December (12)
        $sort: { "_id": 1 } 
      }
    ]);

    // 2. Map the numeric month (1-12) to a Name (Jan-Dec)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // 3. Format data to match what Recharts expects: { month: 'Jan', amount: 5000 }
    const formattedData = trends.map(item => ({
      month: monthNames[item._id - 1],
      amount: item.amount
    }));

    // 4. Send the real data back to the frontend
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation trends',
      error: error.message
    });
  }
};
