import express from 'express';
import { getSuccessStories, getSuccessStory } from '../controllers/campaign.controller.js';

const router = express.Router();

router.get('/', getSuccessStories);
router.get('/:id', getSuccessStory);

export default router;

