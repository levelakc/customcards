import express from 'express';
const router = express.Router();
import { addOrderItems, getOrders, updateOrderStatus, deleteOrder, deleteOrders, updateOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders)
    .delete(protect, admin, deleteOrders); // For bulk delete

router.route('/:id')
    .delete(protect, admin, deleteOrder) // For single delete
    .put(protect, admin, updateOrder); // For updating an order

router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;