import express from 'express';
const router = express.Router();
import { 
    authUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile,
    getUsers, 
    deleteUser, 
    updateUser 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);

// New route for user's own profile
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin routes for managing a specific user by ID
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

export default router;