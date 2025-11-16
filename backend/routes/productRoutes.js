import express from 'express';
const router = express.Router();
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview, 
    getUpsellProduct,
    searchProducts // Import the new searchProducts controller
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/upsell', getUpsellProduct); 
router.get('/search', searchProducts); // New route for product search
router.route('/:id/reviews').post(protect, createProductReview); 
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

export default router;