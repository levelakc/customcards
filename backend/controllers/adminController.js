import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersToday = await Order.find({
        createdAt: {
            $gte: today,
            $lt: tomorrow,
        },
    });

    const totalOrdersToday = ordersToday.length;
    const totalRevenueToday = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);

    res.json({
        totalOrdersToday,
        totalRevenueToday,
    });
});

export { getDashboardStats };