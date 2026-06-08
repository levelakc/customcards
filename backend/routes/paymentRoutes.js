import express from 'express';
const router = express.Router();
import { processMakePayment } from '../controllers/makePaymentController.js';
import { guestOrProtect } from '../middleware/authMiddleware.js';

router.post('/make', guestOrProtect, processMakePayment);

export default router;