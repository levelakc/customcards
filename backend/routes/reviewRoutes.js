import express from 'express';
const router = express.Router();
import { createReview, getReviews, deleteReview, updateReview } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getReviews).post(protect, createReview);
router.route('/:id').delete(protect, admin, deleteReview).put(protect, admin, updateReview);

export default router;