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
import User from '../models/userModel.js';

router.get('/db-check', async (req, res) => {
    try {
        const count = await User.countDocuments({});
        const adminUser = await User.findOne({ email: 'admin@vip-card.co.il' });
        res.json({
            connected: true,
            userCount: count,
            adminFound: !!adminUser,
            dbName: User.db.name,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ connected: false, error: error.message });
    }
});

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