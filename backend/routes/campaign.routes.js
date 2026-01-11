import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addComment,
  addUpdate,
  getMyCampaigns,
  getPublicStats
} from '../controllers/campaign.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'images') {
      cb(null, path.join(__dirname, '../uploads/images'));
    } else if (file.fieldname === 'documents') {
      cb(null, path.join(__dirname, '../uploads/documents'));
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/');

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG/PNG) and documents (PDF/DOC/DOCX) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// Validation rules
const campaignValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('story').trim().notEmpty().withMessage('Story is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('goalAmount').isNumeric().withMessage('Goal amount must be a number'),
  body('endDate').notEmpty().withMessage('End date is required')
];

router.get('/', getCampaigns);
router.get('/stats', getPublicStats);
router.get('/my-campaigns', protect, getMyCampaigns);
router.get('/:id', getCampaign);
router.post('/', protect, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]), campaignValidation, createCampaign);
router.put('/:id', protect, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]), updateCampaign);
router.delete('/:id', protect, deleteCampaign);
router.post('/:id/comments', protect, body('text').trim().notEmpty(), addComment);
router.post('/:id/updates', protect, upload.single('image'), addUpdate);

export default router;

