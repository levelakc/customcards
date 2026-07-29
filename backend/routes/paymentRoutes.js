import express from 'express';
const router = express.Router();
import { initiatePayment, payplusWebhook } from '../controllers/payplusController.js';
import { guestOrProtect } from '../middleware/authMiddleware.js';

router.post('/initiate', guestOrProtect, initiatePayment);
router.post('/webhook', payplusWebhook); // Webhooks must be public

export default router;