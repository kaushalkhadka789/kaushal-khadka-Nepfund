import express from 'express';
import {
  getMyRewards,
  getTopDonors,
  getDonationTrends,
  grantBonusPoints,
  updateRewardConfig
} from '../controllers/reward.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/top', getTopDonors);
router.get('/trends', getDonationTrends);
// Protected routes
router.get('/me', protect, getMyRewards);

// Admin routes
router.post('/admin/grant-points', protect, authorize('admin'), grantBonusPoints);
router.put('/admin/config', protect, authorize('admin'), updateRewardConfig);

export default router;

