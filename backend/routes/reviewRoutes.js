import express from 'express';
const router = express.Router();
import { createReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(getReviews).post(protect, createReview);

export default router;