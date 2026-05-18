import express from 'express';
const router = express.Router();
import { createPaymentIntent, getStripeApiKey } from '../controllers/paymentController.js';
import { guestOrProtect } from '../middleware/authMiddleware.js';

router.post('/create-payment-intent', guestOrProtect, createPaymentIntent);
router.get('/stripe-key', getStripeApiKey);

export default router;