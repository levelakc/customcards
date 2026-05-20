import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';
    
    console.log(`Login attempt for: ${email}`);
    let user = await User.findOne({ email });

    // BOOTSTRAP: If no users exist at all, create the default admin
    const userCount = await User.countDocuments({});
    if (userCount === 0 && email === 'admin@vip-card.co.il') {
        console.log('DB is empty. Bootstrapping admin user...');
        user = await User.create({
            name: 'VIPCard Admin',
            email: 'admin@vip-card.co.il',
            password: 'VipCardSecure2026!',
            isAdmin: true,
            phone: '000-000-0000',
            address: {
                street: 'Main St',
                city: 'Israel',
                postalCode: '00000',
            }
        });
        console.log('Admin user bootstrapped successfully');
    }

    if (user) {
        console.log('User found in database');
        const isMatch = await user.matchPassword(password);
        console.log(`Password match: ${isMatch}`);
        
        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
            return;
        }
    } else {
        console.log('User not found in database');
    }

    res.status(401);
    throw new Error('invalidEmailOrPassword');
});

// @desc    Register a new user
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, phone, address });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            phone: user.phone,
            address: user.address,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        if (req.body.address) {
            user.address = { ...user.address, ...req.body.address };
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id), // Re-issue token in case details changed
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- ADMIN FUNCTIONS ---
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        if (req.body.address) {
            user.address = { ...user.address, ...req.body.address };
        }
        user.isAdmin = req.body.isAdmin ?? user.isAdmin;
        
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, updateUser };