import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';

// @desc    Test route for admin
// @route   GET /api/admin/test
// @access  Private/Admin
router.get('/test', protect, admin, (req, res) => {
    res.json({ message: 'Admin route test successful' });
});

export default router;
