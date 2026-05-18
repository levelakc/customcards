import mongoose from 'mongoose';
import dotenv from 'dotenv';
import adminUsers from './data/adminUsers.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Category from './models/categoryModel.js';
import Gallery from './models/galleryModel.js';
import Order from './models/orderModel.js';
import SiteSettings from './models/siteSettingsModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const resetData = async () => {
  try {
    console.log('🗑️ Clearing all data from the database...');
    
    // Clear all collections
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Gallery.deleteMany();
    await Order.deleteMany();
    // await SiteSettings.deleteMany(); // Keeping site settings might be safer, but user asked for "all data"
    
    console.log('✅ Database cleared.');

    // Seed only admin users
    await User.create(adminUsers);
    console.log('👤 Admin Users Seeded!');

    console.log('🚀 Database is now clean and ready for manual setup.');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

resetData();
