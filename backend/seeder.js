import mongoose from 'mongoose';
import dotenv from 'dotenv';
import adminUsers from './data/adminUsers.js';
import galleryImages from './data/galleryData.js';
import User from './models/userModel.js';
import Gallery from './models/galleryModel.js'; // Import Gallery model
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear all other data models if needed
    // await Product.deleteMany();
    // await Category.deleteMany();
    await User.deleteMany();
    await Gallery.deleteMany(); // Clear existing gallery data

    // The .create() method will automatically trigger the hashing middleware in userModel.js
    await User.create(adminUsers);
    await Gallery.create({ images: galleryImages }); // Seed gallery data

    console.log('✅✅✅ Data Imported Successfully! ✅✅✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
