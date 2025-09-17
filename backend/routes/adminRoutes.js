import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';

// @desc    Test route for admin
// @route   GET /api/admin/test
// @access  Private/Admin
router.get('/test', protect, admin, (req, res) => {
    res.json({ message: 'Admin route test successful' });
});

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
router.route('/dashboard/stats').get(protect, admin, getDashboardStats);

export default router;