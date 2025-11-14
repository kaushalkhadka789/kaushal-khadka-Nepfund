import Campaign from '../models/Campaign.model.js';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { getRelativeUploadPath, toCampaignResponse } from '../utils/campaign.utils.js';

// @desc    Get all campaigns (with filters)
// @route   GET /api/campaigns
// @access  Public
export const getCampaigns = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 10,
      page = 1,
      isSuccessStory,
      isUrgent
    } = req.query;

    const query = {};
    const parseStatusValue = (value) => {
      if (!value) return null;
      if (Array.isArray(value)) {
        const cleaned = value.map((item) => String(item).trim()).filter(Boolean);
        if (cleaned.length === 0) return null;
        if (cleaned.length === 1) return cleaned[0];
        return { $in: cleaned };
      }
      const strValue = String(value).trim();
      if (!strValue) return null;
      if (strValue.includes(',')) {
        const parts = strValue.split(',').map((part) => part.trim()).filter(Boolean);
        if (parts.length === 0) return null;
        if (parts.length === 1) return parts[0];
        return { $in: parts };
      }
      return strValue;
    };

    const assignStatusFilter = (value) => {
      const parsed = parseStatusValue(value);
      if (parsed) {
        query.status = parsed;
      }
    };

    const hasSuccessStoryFilter = typeof isSuccessStory !== 'undefined';

    if (hasSuccessStoryFilter) {
      const normalized = String(isSuccessStory).toLowerCase();
      const boolValue = normalized === 'true' || normalized === '1' || normalized === 'yes';
      query.isSuccessStory = boolValue;

      if (status) {
        assignStatusFilter(status);
      } else if (boolValue) {
        assignStatusFilter('completed');
      } else {
        assignStatusFilter('approved');
      }
    } else if (status) {
      assignStatusFilter(status);
    } else {
      assignStatusFilter('approved');
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (typeof isUrgent !== 'undefined') {
      const normalized = String(isUrgent).toLowerCase();
      const boolValue = normalized === 'true' || normalized === '1' || normalized === 'yes';
      query.isUrgent = boolValue;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const campaigns = await Campaign.find(query)
      .populate('fundraiser', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(numericLimit);

    const total = await Campaign.countDocuments(query);
    const data = campaigns.map(toCampaignResponse);

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('fundraiser', 'name email avatar')
      .populate('comments.user', 'name avatar');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      success: true,
      data: toCampaignResponse(campaign)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
export const createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      story,
      category,
      goalAmount,
      endDate,
      isUrgent
    } = req.body;

    // Handle file uploads (images and documents) - store relative paths and metadata
    const images = req.files?.images ? req.files.images.map(file => {
      return getRelativeUploadPath(file.path, `uploads/images/${file.filename}`);
    }) : [];
    const documents = req.files?.documents ? req.files.documents.map(file => {
      const url = getRelativeUploadPath(file.path, `uploads/documents/${file.filename}`);
      const isImage = file.mimetype.startsWith('image/');
      return {
        url,
        mime: file.mimetype,
        type: isImage ? 'image' : 'document',
        name: file.originalname,
        verified: false,
      };
    }) : [];

    const campaign = await Campaign.create({
      title,
      description,
      story,
      category,
      goalAmount,
      endDate,
      isUrgent: isUrgent === 'true',
      fundraiser: req.user.id,
      images,
      documents,
      imageUrl: images[0] || ''
    });

    // Add campaign to user's campaignsCreated
    await User.findByIdAndUpdate(req.user.id, {
      $push: { campaignsCreated: campaign._id }
    });

    // Notify admins in real-time about new campaign
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admins').emit('admin:campaign:new', campaign);
      }
    } catch {}

    res.status(201).json({
      success: true,
      data: toCampaignResponse(campaign)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Fundraiser or Admin)
export const updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is fundraiser or admin
    if (campaign.fundraiser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Handle deletions first
    const parseJsonArray = (val) => {
      try {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return JSON.parse(val);
        return [];
      } catch { return []; }
    };

    const deletedImages = parseJsonArray(req.body.deletedImages);
    const deletedDocuments = parseJsonArray(req.body.deletedDocuments);

    if (deletedImages.length) {
      campaign.images = (campaign.images || []).filter((u) => !deletedImages.includes(u));
      // remove files from disk
      deletedImages.forEach((rel) => {
        const filePath = path.join(process.cwd(), 'backend', rel.replace(/\\/g, '/'));
        fs.unlink(filePath, () => {});
      });
      if (campaign.imageUrl && deletedImages.includes(campaign.imageUrl)) {
        campaign.imageUrl = '';
      }
    }

    if (deletedDocuments.length) {
      const getUrl = (d) => typeof d === 'string' ? d : (d.url || d.path || '');
      campaign.documents = (campaign.documents || []).filter((d) => !deletedDocuments.includes(getUrl(d)));
      deletedDocuments.forEach((rel) => {
        const filePath = path.join(process.cwd(), 'backend', rel.replace(/\\/g, '/'));
        fs.unlink(filePath, () => {});
      });
    }

    // Handle file uploads - store relative paths
    if (req.files?.images) {
      const newImages = req.files.images.map(file => {
        return getRelativeUploadPath(file.path, `uploads/images/${file.filename}`);
      });
      campaign.images = [...(campaign.images || []), ...newImages];
      if (!campaign.imageUrl && newImages.length > 0) {
        campaign.imageUrl = newImages[0];
      }
    }

    if (req.files?.documents) {
      const newDocuments = req.files.documents.map(file => {
        const url = getRelativeUploadPath(file.path, `uploads/documents/${file.filename}`);
        const isImage = file.mimetype.startsWith('image/');
        return {
          url,
          mime: file.mimetype,
          type: isImage ? 'image' : 'document',
          name: file.originalname,
          verified: false,
        };
      });
      campaign.documents = [...(campaign.documents || []), ...newDocuments];
    }

    // Update fields
    const allowedFields = ['title', 'description', 'story', 'category', 'goalAmount', 'endDate', 'isUrgent'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });

    if (!campaign.imageUrl) {
      const galleryImages = Array.isArray(campaign.storyDetails?.images) ? campaign.storyDetails.images : [];
      const campaignImages = Array.isArray(campaign.images) ? campaign.images : [];
      campaign.imageUrl = galleryImages[0] || campaignImages[0] || '';
    }

    await campaign.save();

    res.status(200).json({
      success: true,
      data: toCampaignResponse(campaign)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Fundraiser or Admin)
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is fundraiser or admin
    if (campaign.fundraiser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    await campaign.deleteOne();

    // Cascade delete related donations so they no longer appear in users' histories
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

// @desc    Add comment to campaign
// @route   POST /api/campaigns/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.comments.push({
      user: req.user.id,
      text
    });

    await campaign.save();

    const updatedCampaign = await Campaign.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    res.status(200).json({
      success: true,
      data: updatedCampaign.comments[updatedCampaign.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add update to campaign
// @route   POST /api/campaigns/:id/updates
// @access  Private (Fundraiser)
export const addUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user is fundraiser
    if (campaign.fundraiser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add updates to this campaign'
      });
    }

    const image = req.file ? getRelativeUploadPath(req.file.path, `uploads/images/${req.file.filename}`) : '';

    campaign.updates.push({
      title,
      content,
      image
    });

    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign.updates[campaign.updates.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my campaigns
// @route   GET /api/campaigns/my-campaigns
// @access  Private
export const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ fundraiser: req.user.id })
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

// @desc    Get list of success stories
// @route   GET /api/success-stories
// @access  Public
export const getSuccessStories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const numericLimit = Math.max(parseInt(limit, 10) || 6, 1);

    const stories = await Campaign.find({ isSuccessStory: true })
      .sort({ updatedAt: -1 })
      .limit(numericLimit);

    const data = stories.map(toCampaignResponse);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single success story by id
// @route   GET /api/success-stories/:id
// @access  Public
export const getSuccessStory = async (req, res) => {
  try {
    const story = await Campaign.findById(req.params.id)
      .populate('fundraiser', 'name email avatar');

    if (!story || !story.isSuccessStory) {
      return res.status(404).json({
        success: false,
        message: 'Success story not found'
      });
    }

    res.status(200).json({
      success: true,
      data: toCampaignResponse(story)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

