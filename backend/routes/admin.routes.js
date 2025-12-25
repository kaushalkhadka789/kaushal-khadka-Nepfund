import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  deleteCampaignByAdmin,
  markCampaignAsSuccessStory
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const successUploadsDir = path.join(__dirname, '../uploads/success');
fs.mkdirSync(successUploadsDir, { recursive: true });

const successStoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, successUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `success-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed for success story gallery'));
  }
};

const successStoryUpload = multer({
  storage: successStoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/campaigns/pending', getPendingCampaigns);
router.put('/campaigns/:id/approve', approveCampaign);
router.put('/campaigns/:id/reject', rejectCampaign);
router.put('/campaigns/:id/success-story', successStoryUpload.array('images', 5), markCampaignAsSuccessStory);
router.delete('/campaigns/:id', deleteCampaignByAdmin);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;

