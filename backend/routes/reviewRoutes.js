import express from 'express';
const router = express.Router();
import { createReview, getReviews, deleteReview } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getReviews).post(protect, createReview);
router.route('/:id').delete(protect, admin, deleteReview);

export default router;