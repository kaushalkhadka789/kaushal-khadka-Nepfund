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

    // Validate campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not approved for donations'
      });
    }

    // Check if goal is already reached
    if (campaign.raisedAmount >= campaign.goalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Campaign goal has already been reached'
      });
    }

    // Idempotency: if this paymentId already exists, return existing donation without re-counting
    const existing = await Donation.findOne({ paymentId }).populate('campaign', 'title').populate('donor', 'name email');
    if (existing) {
      // Get user's current reward points for response
      const user = await User.findById(req.user.id);
      return res.status(200).json({ 
        success: true, 
        data: { ...existing.toObject(), isDuplicate: true },
        rewardInfo: {
          pointsEarned: 0,
          totalPoints: user?.rewardPoints || 0
        }
      });
    }

    // Create donation
    const donation = await Donation.create({
      campaign: campaignId,
      donor: req.user.id,
      amount,
      paymentMethod,
      paymentId,
      isAnonymous: isAnonymous === true || isAnonymous === 'true',
      message,
      status: 'completed'
    });

    // Check if this donation would exceed the goal
    const newRaisedAmount = campaign.raisedAmount + amount;
    const goalReached = newRaisedAmount >= campaign.goalAmount;

    // Update campaign
    campaign.raisedAmount = Math.min(newRaisedAmount, campaign.goalAmount); // Cap at goal
    campaign.donorCount += 1;
    
    // Mark as completed if goal is reached
    if (goalReached && campaign.status === 'approved') {
      campaign.status = 'completed';
    }
    
    await campaign.save();

    // Calculate reward points (1 point per NPR 10)
    const pointsEarned = calculatePoints(amount);
    
    // Update user's donation history and reward points atomically
    const updateResult = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { donationsMade: donation._id },
        $inc: { totalDonated: amount, rewardPoints: pointsEarned }
      },
      { new: true } // Return updated document
    );
    
    // Verify the update was successful
    if (!updateResult) {
      throw new Error('Failed to update user reward points');
    }
    
    // Create reward transaction record
    const rewardTransaction = await RewardTransaction.create({
      userId: req.user.id,
      campaignId: campaignId,
      donationId: donation._id,
      donationAmount: amount,
      pointsEarned: pointsEarned,
      reason: 'donation'
    });

    // Verify transaction was created
    if (!rewardTransaction) {
      console.error('Warning: Reward transaction was not created for donation:', donation._id);
    }

    // Get updated user with reward points (use the result from update)
    const updatedUser = updateResult;
    
    // Populate donation data
    const populatedDonation = await Donation.findById(donation._id)
      .populate('campaign', 'title')
      .populate('donor', 'name email');
    
    // Add reward information to response
    populatedDonation.rewardInfo = {
      pointsEarned,
      totalPoints: updatedUser.rewardPoints
    };

    // Broadcast real-time updates via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        // Broadcast campaign update to all clients
        const updatedCampaign = await Campaign.findById(campaignId)
          .populate('fundraiser', 'name email avatar');
        
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
    } catch (socketError) {
      // Don't fail the donation if socket broadcast fails
      console.error('Socket.IO broadcast error:', socketError);
    }

    res.status(201).json({
      success: true,
      data: populatedDonation,
      goalReached,
      rewardInfo: {
        pointsEarned,
        totalPoints: updatedUser.rewardPoints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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

