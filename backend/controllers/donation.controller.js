import Donation from '../models/Donation.model.js';
import Campaign from '../models/Campaign.model.js';
import User from '../models/User.model.js';
import RewardTransaction from '../models/RewardTransaction.model.js';
import { calculatePoints } from '../utils/reward.utils.js';

// @desc    Create donation
// @route   POST /api/donations
// @access  Private
export const createDonation = async (req, res) => {
  try {
    const { campaignId, amount, paymentMethod, paymentId, isAnonymous, message } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!userId) {
      console.error('Donation creation error: User ID missing from request');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!campaignId) {
      console.error('Donation creation error: campaignId missing', { body: req.body });
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required'
      });
    }

    if (!amount || amount <= 0) {
      console.error('Donation creation error: Invalid amount', { amount });
      return res.status(400).json({
        success: false,
        message: 'Valid donation amount is required'
      });
    }

    if (!paymentId) {
      console.error('Donation creation error: paymentId missing', { body: req.body });
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Validate campaign exists before any operations
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      console.error('Donation creation error: Campaign not found', { campaignId });
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'approved') {
      console.error('Donation creation error: Campaign not approved', { campaignId, status: campaign.status });
      return res.status(400).json({
        success: false,
        message: 'Campaign is not approved for donations'
      });
    }

    // Check if goal is already reached
    if (campaign.raisedAmount >= campaign.goalAmount) {
      console.error('Donation creation error: Campaign goal already reached', { campaignId, raisedAmount: campaign.raisedAmount, goalAmount: campaign.goalAmount });
      return res.status(400).json({
        success: false,
        message: 'Campaign goal has already been reached'
      });
    }

    // Idempotency: if this paymentId already exists, return existing donation without re-counting
    const existing = await Donation.findOne({ paymentId }).populate('campaign', 'title').populate('donor', 'name email');
    if (existing) {
      // Get user's current reward points for response
      const user = await User.findById(userId);
      return res.status(200).json({ 
        success: true,
        isDuplicate: true,
        rewardInfo: {
          pointsEarned: 0,
          totalPoints: user?.rewardPoints || 0
        }
      });
    }

    // Create donation with all required fields
    let donation;
    try {
      donation = await Donation.create({
        campaign: campaignId,
        donor: userId,
        amount,
        paymentMethod: paymentMethod || 'khalti',
        paymentId,
        isAnonymous: isAnonymous === true || isAnonymous === 'true',
        message: message || '',
        status: 'completed'
      });
    } catch (createError) {
      console.error('Donation creation error: Failed to create donation record', {
        error: createError.message,
        stack: createError.stack,
        campaignId,
        userId,
        amount,
        paymentId
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to create donation record: ' + createError.message
      });
    }

    // Verify campaign still exists before updating (race condition protection)
    const campaignToUpdate = await Campaign.findById(campaignId);
    if (!campaignToUpdate) {
      console.error('Donation creation error: Campaign deleted during donation creation', { campaignId, donationId: donation._id });
      // Donation was created but campaign is gone - this is a critical error
      // We should still try to return success but log the error
      try {
        await donation.deleteOne();
      } catch (deleteError) {
        console.error('Failed to delete orphaned donation:', deleteError);
      }
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if this donation would exceed the goal
    const newRaisedAmount = campaignToUpdate.raisedAmount + amount;
    const goalReached = newRaisedAmount >= campaignToUpdate.goalAmount;

    // Update campaign
    campaignToUpdate.raisedAmount = Math.min(newRaisedAmount, campaignToUpdate.goalAmount); // Cap at goal
    campaignToUpdate.donorCount += 1;
    
    // Mark as completed if goal is reached
    if (goalReached && campaignToUpdate.status === 'approved') {
      campaignToUpdate.status = 'completed';
    }
    
    try {
      await campaignToUpdate.save();
    } catch (campaignUpdateError) {
      console.error('Donation creation error: Failed to update campaign', {
        error: campaignUpdateError.message,
        campaignId,
        donationId: donation._id
      });
      // Donation was created but campaign update failed - try to continue with reward logic
    }

    // Calculate reward points (1 point per NPR 10)
    let pointsEarned = 0;
    let totalPoints = 0;
    let rewardInfo = null;

    try {
      pointsEarned = calculatePoints(amount);
      
      // Update user's donation history and reward points atomically
      const updateResult = await User.findByIdAndUpdate(
        userId,
        {
          $push: { donationsMade: donation._id },
          $inc: { totalDonated: amount, rewardPoints: pointsEarned }
        },
        { new: true } // Return updated document
      );
      
      // Verify the update was successful
      if (!updateResult) {
        console.error('Donation creation error: Failed to update user reward points', { userId, donationId: donation._id });
        // Continue with donation creation but log the error
      } else {
        totalPoints = updateResult.rewardPoints || 0;
        
        // Create reward transaction record
        try {
          await RewardTransaction.create({
            userId: userId,
            campaignId: campaignId,
            donationId: donation._id,
            donationAmount: amount,
            pointsEarned: pointsEarned,
            reason: 'donation'
          });
        } catch (rewardTransactionError) {
          // Don't fail donation if reward transaction creation fails
          console.error('Warning: Reward transaction was not created for donation:', {
            donationId: donation._id,
            error: rewardTransactionError.message
          });
        }

        rewardInfo = {
          pointsEarned,
          totalPoints
        };
      }
    } catch (rewardError) {
      // Don't fail donation creation if reward logic fails
      console.error('Donation creation error: Reward processing failed', {
        error: rewardError.message,
        donationId: donation._id,
        userId
      });
      // Try to get user's current points as fallback
      try {
        const user = await User.findById(userId);
        totalPoints = user?.rewardPoints || 0;
        rewardInfo = {
          pointsEarned: 0,
          totalPoints
        };
      } catch (userError) {
        console.error('Failed to get user reward points as fallback:', userError);
        rewardInfo = {
          pointsEarned: 0,
          totalPoints: 0
        };
      }
    }

    // Broadcast real-time updates via Socket.IO (don't let this fail the request)
    try {
      const io = req.app.get('io');
      if (io) {
        // Broadcast campaign update to all clients
        const updatedCampaign = await Campaign.findById(campaignId)
          .populate('fundraiser', 'name email avatar');
        
        if (updatedCampaign) {
          io.emit('campaign:updated', {
            _id: updatedCampaign._id.toString(),
            raisedAmount: updatedCampaign.raisedAmount,
            goalAmount: updatedCampaign.goalAmount,
            donorCount: updatedCampaign.donorCount,
            status: updatedCampaign.status,
            progress: Math.min((updatedCampaign.raisedAmount / updatedCampaign.goalAmount) * 100, 100).toFixed(1)
          });

          // Broadcast dashboard stats update for admins
          const totalCampaigns = await Campaign.countDocuments();
          const approvedCampaigns = await Campaign.countDocuments({ status: 'approved' });
          const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
          const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });
          const totalUsers = await User.countDocuments();
          const totalDonors = await Donation.distinct('donor').then(donors => donors.length);
          
          const totalDonationsAgg = await Donation.aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ]);

          io.to('admins').emit('dashboard:stats', {
            campaigns: {
              total: totalCampaigns,
              approved: approvedCampaigns,
              pending: pendingCampaigns,
              completed: completedCampaigns
            },
            users: {
              total: totalUsers,
              donors: totalDonors
            },
            donations: {
              total: totalDonationsAgg[0]?.total || 0,
              count: totalDonationsAgg[0]?.count || 0
            }
          });
        }
      }
    } catch (socketError) {
      // Don't fail the donation if socket broadcast fails
      console.error('Socket.IO broadcast error:', socketError);
    }

    // Return consistent response format
    res.status(201).json({
      success: true,
      isDuplicate: false,
      rewardInfo: rewardInfo || {
        pointsEarned: 0,
        totalPoints: 0
      }
    });
  } catch (error) {
    // Log the exact error for debugging
    console.error('Donation creation error: Unexpected error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create donation: ' + error.message
    });
  }
};

// @desc    Get donations for a campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Public
export const getCampaignDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.campaignId })
      .populate('donor', 'name avatar rewardPoints')
      .sort({ createdAt: -1 });

    // Filter anonymous donations and add tier information
    const filteredDonations = donations.map(donation => {
      if (donation.isAnonymous) {
        donation.donor = { name: 'Anonymous', avatar: '', rewardPoints: 0 };
      } else if (donation.donor && donation.donor.rewardPoints !== undefined) {
        // Tier information will be calculated on frontend
        donation.donor = {
          ...donation.donor.toObject(),
          rewardPoints: donation.donor.rewardPoints || 0
        };
      }
      return donation;
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: filteredDonations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my donations
// @route   GET /api/donations/my-donations
// @access  Private
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title images category')
      .sort({ createdAt: -1 });

    // Filter out donations whose campaign was deleted
    const visibleDonations = donations.filter(d => d.campaign);

    res.status(200).json({
      success: true,
      count: visibleDonations.length,
      data: visibleDonations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Private (Admin)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('campaign', 'title')
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

