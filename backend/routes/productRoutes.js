import express from 'express';
const router = express.Router();
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview, // Import new controller
    getUpsellProduct
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/upsell', getUpsellProduct); // New route for the upsell product
router.route('/:id/reviews').post(protect, createProductReview); // Add new route
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

export default router;