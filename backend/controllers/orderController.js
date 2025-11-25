import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

const DELIVERY_FEE_ILS = 50; // New constant for delivery fee

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
    const { orderItems, messageToDesigner, guestInfo } = req.body; // Removed totalPrice from destructuring as it will be calculated

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        // Calculate total price including delivery fee
        const itemsPrice = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);
        const finalTotalPrice = itemsPrice + DELIVERY_FEE_ILS;

        let orderData = {
            orderItems,
            totalPrice: finalTotalPrice, // Use finalTotalPrice
            messageToDesigner, // Include messageToDesigner
        };

        if (req.user) {
            orderData.user = req.user._id;
            orderData.shippingAddress = req.body.shippingAddress;
        } else if (guestInfo) {
            orderData.guestInfo = guestInfo;
        } else {
            res.status(400).json({ message: 'User information is missing' });
            return;
        }

        const order = new Order(orderData);
        const createdOrder = await order.save();
        
        // Emit a new order event to all connected clients
        req.io.emit('newOrder', createdOrder);

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

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (order) {
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
};

// @desc    Delete multiple orders (admin only)
// @route   DELETE /api/orders
const deleteOrders = async (req, res) => {
    const { orderIds } = req.body;

    try {
        if (orderIds && orderIds.length > 0) {
            const result = await Order.deleteMany({ _id: { $in: orderIds } });
            res.json({ message: `${result.deletedCount} orders removed` });
        } else {
            res.status(400).json({ message: 'No order IDs provided' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting orders', error: error.message });
    }
};

const updateOrder = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone address');

    if (order) {
        // Update user details if provided
        if (req.body.user) {
            const user = await User.findById(order.user._id);
            if (user) {
                user.name = req.body.user.name || user.name;
                user.email = req.body.user.email || user.email;
                user.phone = req.body.user.phone || user.phone;
                if (req.body.user.address) {
                    user.address.street = req.body.user.address.street || user.address.street;
                    user.address.city = req.body.user.address.city || user.address.city;
                    user.address.postalCode = req.body.user.address.postalCode || user.address.postalCode;
                }
                await user.save();
            }
        }

        // Update order items if provided
        if (req.body.orderItems) {
            order.orderItems = req.body.orderItems;
            order.totalPrice = order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

export { addOrderItems, getOrders, updateOrderStatus, deleteOrder, deleteOrders, updateOrder };
