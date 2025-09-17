import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import { getDashboardStats, getDashboardSummary, getSalesTrend, getTopSellingProducts, getSalesByCategory } from '../controllers/adminController.js';

// @desc    Test route for admin
// @route   GET /api/admin/test
// @access  Private/Admin
router.get('/test', protect, admin, (req, res) => {
    res.json({ message: 'Admin route test successful' });
});

// @desc    Get dashboard statistics for admin (deprecated, use /summary instead)
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
router.route('/dashboard/stats').get(protect, admin, getDashboardStats);

// @desc    Get comprehensive dashboard summary for admin
// @route   GET /api/admin/dashboard/summary
// @access  Private/Admin
router.route('/dashboard/summary').get(protect, admin, getDashboardSummary);

// @desc    Get sales trend data for admin dashboard
// @route   GET /api/admin/dashboard/sales-trend
// @access  Private/Admin
router.route('/dashboard/sales-trend').get(protect, admin, getSalesTrend);

// @desc    Get top selling products for admin dashboard
// @route   GET /api/admin/dashboard/top-products
// @access  Private/Admin
router.route('/dashboard/top-products').get(protect, admin, getTopSellingProducts);

// @desc    Get sales by category for admin dashboard
// @route   GET /api/admin/dashboard/sales-by-category
// @access  Private/Admin
router.route('/dashboard/sales-by-category').get(protect, admin, getSalesByCategory);

export default router;