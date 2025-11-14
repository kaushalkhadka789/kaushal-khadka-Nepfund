import Campaign from '../models/Campaign.model.js';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import fs from 'fs';
import path from 'path';
import { getRelativeUploadPath, toCampaignResponse } from '../utils/campaign.utils.js';

// @desc    Get all pending campaigns
// @route   GET /api/admin/campaigns/pending
// @access  Private (Admin)
export const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending' })
      .populate('fundraiser', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve campaign
// @route   PUT /api/admin/campaigns/:id/approve
// @access  Private (Admin)
export const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.status = 'approved';
    await campaign.save();

    // Notify the fundraiser in real-time about approval
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${campaign.fundraiser.toString()}`).emit('campaign:updated', campaign);
        // Broadcast to all clients so homepage can update live
        io.emit('campaign:approved', campaign);
      }
    } catch {}

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark campaign as success story and attach story details
// @route   PUT /api/admin/campaigns/:id/success-story
// @access  Private (Admin)
export const markCampaignAsSuccessStory = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const newImages = uploadedFiles.map((file) =>
      getRelativeUploadPath(file.path, `uploads/success/${file.filename}`)
    );

    const existingDetails = campaign.storyDetails || { message: '', images: [], videoUrl: '' };
    if (newImages.length > 0 && Array.isArray(existingDetails.images) && existingDetails.images.length > 0) {
      existingDetails.images.forEach((imgPath) => {
        const normalized = (imgPath || '').replace(/\\/g, '/');
        const relative = normalized.startsWith('/') ? normalized.substring(1) : normalized;
        const absolute = path.join(process.cwd(), 'backend', relative);
        fs.unlink(absolute, () => {});
      });
    }
    const sanitizedMessage = typeof req.body.message === 'string' ? req.body.message.trim() : existingDetails.message;
    const sanitizedVideoUrl = typeof req.body.videoUrl === 'string' ? req.body.videoUrl.trim() : existingDetails.videoUrl;
    const imagesToUse = newImages.length > 0 ? newImages : (existingDetails.images || []);

    campaign.storyDetails = {
      message: req.body.message !== undefined ? sanitizedMessage : existingDetails.message,
      images: imagesToUse,
      videoUrl: req.body.videoUrl !== undefined ? sanitizedVideoUrl : existingDetails.videoUrl
    };

    campaign.isSuccessStory = true;
    campaign.status = 'completed';

    if (campaign.storyDetails.images.length > 0) {
      campaign.imageUrl = campaign.storyDetails.images[0];
    } else if (!campaign.imageUrl && Array.isArray(campaign.images) && campaign.images.length > 0) {
      campaign.imageUrl = campaign.images[0];
    }

    await campaign.save();
    await campaign.populate('fundraiser', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Success story saved',
      data: toCampaignResponse(campaign)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject campaign
// @route   PUT /api/admin/campaigns/:id/reject
// @access  Private (Admin)
export const rejectCampaign = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.status = 'rejected';
    campaign.rejectionReason = rejectionReason || 'Campaign does not meet our guidelines';
    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete any campaign (approved/rejected/pending)
// @route   DELETE /api/admin/campaigns/:id
// @access  Private (Admin)
export const deleteCampaignByAdmin = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    await campaign.deleteOne();
    // Remove all donations tied to this campaign to clean up user donation lists
    await Donation.deleteMany({ campaign: campaign._id });

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const approvedCampaigns = await Campaign.countDocuments({ status: 'approved' });
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
    const completedCampaigns = await Campaign.countDocuments({ status: 'completed' });

    const totalUsers = await User.countDocuments();
    const totalDonors = await Donation.distinct('donor').then(donors => donors.length);

    const totalDonations = await Donation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const donationsByCategory = await Donation.aggregate([
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaign',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $group: {
          _id: '$campaign.category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const topCampaigns = await Campaign.find({ status: 'approved' })
      .sort({ raisedAmount: -1 })
      .limit(10)
      .populate('fundraiser', 'name')
      .select('title raisedAmount goalAmount category');

    res.status(200).json({
      success: true,
      data: {
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
          total: totalDonations[0]?.total || 0,
          count: totalDonations[0]?.count || 0
        },
        donationsByCategory,
        topCampaigns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

