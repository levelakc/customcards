import express from 'express';
const router = express.Router();
import { createPaymentIntent, getStripeApiKey } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/create-payment-intent', protect, createPaymentIntent);
router.get('/stripe-key', getStripeApiKey);

export default router;