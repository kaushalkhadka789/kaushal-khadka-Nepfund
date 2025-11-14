import express from 'express';
import {
  createDonation,
  getCampaignDonations,
  getMyDonations,
  getAllDonations
} from '../controllers/donation.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createDonation);
router.get('/campaign/:campaignId', getCampaignDonations);
router.get('/my-donations', protect, getMyDonations);
router.get('/', protect, authorize('admin'), getAllDonations);

export default router;

