import Order from '../models/orderModel.js';

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            // When creating an order, we link it to the logged-in user's ID
            user: req.user._id,
            orderItems,
            totalPrice,
        });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
const getOrders = async (req, res) => {
    // FIX: Updated the populate() method to include all required user fields.
    const orders = await Order.find({}).populate('user', 'id name email phone address');
    res.json(orders);
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

export { addOrderItems, getOrders, updateOrderStatus };