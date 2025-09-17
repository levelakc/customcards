import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

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

// @desc    Get comprehensive dashboard summary for admin
// @route   GET /api/admin/dashboard/summary
// @access  Private/Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
    const now = new Date();

    // Today's Stats
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const ordersToday = await Order.find({ createdAt: { $gte: startOfToday, $lt: endOfToday } });
    const totalOrdersToday = ordersToday.length;
    const totalRevenueToday = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);

    // Last 7 Days Stats
    const startOfLast7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    startOfLast7Days.setHours(0, 0, 0, 0);
    const ordersLast7Days = await Order.find({ createdAt: { $gte: startOfLast7Days, $lt: endOfToday } });
    const totalOrdersLast7Days = ordersLast7Days.length;
    const totalRevenueLast7Days = ordersLast7Days.reduce((acc, order) => acc + order.totalPrice, 0);

    // Last 30 Days Stats
    const startOfLast30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    startOfLast30Days.setHours(0, 0, 0, 0);
    const ordersLast30Days = await Order.find({ createdAt: { $gte: startOfLast30Days, $lt: endOfToday } });
    const totalOrdersLast30Days = ordersLast30Days.length;
    const totalRevenueLast30Days = ordersLast30Days.reduce((acc, order) => acc + order.totalPrice, 0);

    // All Time Stats
    const allOrders = await Order.find({});
    const totalOrdersAllTime = allOrders.length;
    const totalRevenueAllTime = allOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Average Order Value
    const averageOrderValue = totalOrdersAllTime > 0 ? totalRevenueAllTime / totalOrdersAllTime : 0;

    // Customer Stats
    const totalCustomers = await User.countDocuments({});
    const newCustomersToday = await User.countDocuments({ createdAt: { $gte: startOfToday, $lt: endOfToday } });

    res.json({
        totalOrdersToday,
        totalRevenueToday,
        totalOrdersLast7Days,
        totalRevenueLast7Days,
        totalOrdersLast30Days,
        totalRevenueLast30Days,
        totalOrdersAllTime,
        totalRevenueAllTime,
        averageOrderValue,
        totalCustomers,
        newCustomersToday,
    });
});

// @desc    Get sales trend data for admin dashboard
// @route   GET /api/admin/dashboard/sales-trend
// @access  Private/Admin
const getSalesTrend = asyncHandler(async (req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                },
                totalRevenue: { $sum: '$totalPrice' },
                countOrders: { $sum: 1 },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
                '_id.day': 1,
            },
        },
    ]);

    // Fill in missing dates with 0 revenue/orders
    const trendData = {};
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(thirtyDaysAgo.getDate() + i);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        trendData[dateString] = { date: dateString, totalRevenue: 0, countOrders: 0 };
    }

    salesData.forEach(data => {
        const dateString = `${data._id.year}-${data._id.month}-${data._id.day}`;
        if (trendData[dateString]) {
            trendData[dateString].totalRevenue = data.totalRevenue;
            trendData[dateString].countOrders = data.countOrders;
        }
    });

    res.json(Object.values(trendData));
});

// @desc    Get top selling products for admin dashboard
// @route   GET /api/admin/dashboard/top-products
// @access  Private/Admin
const getTopSellingProducts = asyncHandler(async (req, res) => {
    const topProducts = await Order.aggregate([
        { $unwind: '$orderItems' },
        // Ensure product ID is a valid ObjectId before lookup
        { $match: { 'orderItems.product': { $type: 'objectId' } } },
        { $lookup: { from: 'products', localField: '$orderItems.product', foreignField: '_id', as: 'productDetails' } },
        { $match: { 'productDetails': { $ne: [] } } }, // Only proceed if productDetails is not empty
        { $unwind: '$productDetails' },
        {
            $addFields: {
                sanitizedProductName: {
                    $cond: {
                        if: { $regexMatch: { input: '$productDetails.name', regex: '^\\
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }, // Top 5 products
        { $project: { _id: 0, name: 1, image: 1, totalRevenue: 1, totalSold: 1 } },
    ]);

    res.json(topProducts);
});

// @desc    Get sales by category for admin dashboard
// @route   GET /api/admin/dashboard/sales-by-category
// @access  Private/Admin
const getSalesByCategory = asyncHandler(async (req, res) => {
    const salesByCategory = await Order.aggregate([
        { $unwind: '$orderItems' },
        // Ensure product ID is a valid ObjectId before lookup
        { $match: { 'orderItems.product': { $type: 'objectId' } } },
        { $lookup: { from: 'products', localField: '$orderItems.product', foreignField: '_id', as: 'productDetails' } },
        { $match: { 'productDetails': { $ne: [] } } }, // Only proceed if productDetails is not empty
        { $unwind: '$productDetails' },
        // Ensure category ID is a valid ObjectId before lookup
        { $match: { 'productDetails.category': { $type: 'objectId' } } },
        { $lookup: { from: 'categories', localField: '$productDetails.category', foreignField: '_id', as: 'categoryDetails' } },
        { $match: { 'categoryDetails': { $ne: [] } } }, // Only proceed if categoryDetails is not empty
        { $unwind: '$categoryDetails' },
        {
            $addFields: {
                sanitizedCategoryName: {
                    $cond: {
                        if: { $regexMatch: { input: '$categoryDetails.name', regex: '^\\$' } }, // Corrected regex
                        then: { $substrCP: ['$categoryDetails.name', 1, { $strLenCP: '$categoryDetails.name' }] },
                        else: '$categoryDetails.name'
                    }
                }
            }
        },
        {
            $group: {
                _id: { $ifNull: ['$sanitizedCategoryName', 'Unknown Category'] }, // Use the sanitized name
                totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
                totalSold: { $sum: '$orderItems.qty' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        {
            $addFields: {
                categoryName: "$_id"
            }
        },
        {
            $project: {
                _id: 0,
                category: { $getField: "$categoryName" },
                totalRevenue: 1,
                totalSold: 1,
            },
        },
    ]);

    res.json(salesByCategory);
});

export { getDashboardStats, getDashboardSummary, getSalesTrend, getTopSellingProducts, getSalesByCategory }; } },
                        then: { $substrCP: ['$productDetails.name', 1, { $strLenCP: '$productDetails.name' }] },
                        else: '$productDetails.name'
                    }
                },
                sanitizedProductImage: {
                    $cond: {
                        if: { $regexMatch: { input: '$productDetails.image', regex: '^\\
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }, // Top 5 products
        { $project: { _id: 0, name: 1, image: 1, totalRevenue: 1, totalSold: 1 } },
    ]);

    res.json(topProducts);
});

// @desc    Get sales by category for admin dashboard
// @route   GET /api/admin/dashboard/sales-by-category
// @access  Private/Admin
const getSalesByCategory = asyncHandler(async (req, res) => {
    const salesByCategory = await Order.aggregate([
        { $unwind: '$orderItems' },
        // Ensure product ID is a valid ObjectId before lookup
        { $match: { 'orderItems.product': { $type: 'objectId' } } },
        { $lookup: { from: 'products', localField: '$orderItems.product', foreignField: '_id', as: 'productDetails' } },
        { $match: { 'productDetails': { $ne: [] } } }, // Only proceed if productDetails is not empty
        { $unwind: '$productDetails' },
        // Ensure category ID is a valid ObjectId before lookup
        { $match: { 'productDetails.category': { $type: 'objectId' } } },
        { $lookup: { from: 'categories', localField: '$productDetails.category', foreignField: '_id', as: 'categoryDetails' } },
        { $match: { 'categoryDetails': { $ne: [] } } }, // Only proceed if categoryDetails is not empty
        { $unwind: '$categoryDetails' },
        {
            $addFields: {
                sanitizedCategoryName: {
                    $cond: {
                        if: { $regexMatch: { input: '$categoryDetails.name', regex: '^\\$' } }, // Corrected regex
                        then: { $substrCP: ['$categoryDetails.name', 1, { $strLenCP: '$categoryDetails.name' }] },
                        else: '$categoryDetails.name'
                    }
                }
            }
        },
        {
            $group: {
                _id: { $ifNull: ['$sanitizedCategoryName', 'Unknown Category'] }, // Use the sanitized name
                totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
                totalSold: { $sum: '$orderItems.qty' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        {
            $addFields: {
                categoryName: "$_id"
            }
        },
        {
            $project: {
                _id: 0,
                category: { $getField: "$categoryName" },
                totalRevenue: 1,
                totalSold: 1,
            },
        },
    ]);

    res.json(salesByCategory);
});

export { getDashboardStats, getDashboardSummary, getSalesTrend, getTopSellingProducts, getSalesByCategory }; } },
                        then: { $substrCP: ['$productDetails.image', 1, { $strLenCP: '$productDetails.image' }] },
                        else: '$productDetails.image'
                    }
                }
            }
        },
        { $group: { _id: '$orderItems.product', name: { $first: '$sanitizedProductName' }, image: { $first: '$sanitizedProductImage' }, totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }, totalSold: { $sum: '$orderItems.qty' } } }
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }, // Top 5 products
        { $project: { _id: 0, name: 1, image: 1, totalRevenue: 1, totalSold: 1 } },
    ]);

    res.json(topProducts);
});

// @desc    Get sales by category for admin dashboard
// @route   GET /api/admin/dashboard/sales-by-category
// @access  Private/Admin
const getSalesByCategory = asyncHandler(async (req, res) => {
    const salesByCategory = await Order.aggregate([
        { $unwind: '$orderItems' },
        // Ensure product ID is a valid ObjectId before lookup
        { $match: { 'orderItems.product': { $type: 'objectId' } } },
        { $lookup: { from: 'products', localField: '$orderItems.product', foreignField: '_id', as: 'productDetails' } },
        { $match: { 'productDetails': { $ne: [] } } }, // Only proceed if productDetails is not empty
        { $unwind: '$productDetails' },
        // Ensure category ID is a valid ObjectId before lookup
        { $match: { 'productDetails.category': { $type: 'objectId' } } },
        { $lookup: { from: 'categories', localField: '$productDetails.category', foreignField: '_id', as: 'categoryDetails' } },
        { $match: { 'categoryDetails': { $ne: [] } } }, // Only proceed if categoryDetails is not empty
        { $unwind: '$categoryDetails' },
        {
            $addFields: {
                sanitizedCategoryName: {
                    $cond: {
                        if: { $regexMatch: { input: '$categoryDetails.name', regex: '^\\$' } }, // Corrected regex
                        then: { $substrCP: ['$categoryDetails.name', 1, { $strLenCP: '$categoryDetails.name' }] },
                        else: '$categoryDetails.name'
                    }
                }
            }
        },
        {
            $group: {
                _id: { $ifNull: ['$sanitizedCategoryName', 'Unknown Category'] }, // Use the sanitized name
                totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
                totalSold: { $sum: '$orderItems.qty' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        {
            $addFields: {
                categoryName: "$_id"
            }
        },
        {
            $project: {
                _id: 0,
                category: { $getField: "$categoryName" },
                totalRevenue: 1,
                totalSold: 1,
            },
        },
    ]);

    res.json(salesByCategory);
});

export { getDashboardStats, getDashboardSummary, getSalesTrend, getTopSellingProducts, getSalesByCategory };