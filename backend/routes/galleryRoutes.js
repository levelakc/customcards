import express from 'express';
const router = express.Router();
import { getGallery, upsertGallery } from '../controllers/galleryController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming you have this middleware

// Route for getting the gallery images (publicly accessible)
router.route('/').get(getGallery);

// Route for updating/creating the gallery (protected, admin only)
// The .post() here handles both creating and updating, as defined in our controller.
router.route('/').post(protect, admin, upsertGallery);

export default router;
