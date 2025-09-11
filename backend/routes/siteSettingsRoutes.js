import express from 'express';
const router = express.Router();
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getSiteSettings).put(protect, admin, updateSiteSettings);

export default router;