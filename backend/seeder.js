import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js'; // We will create this file next
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear all other data models if needed
    // await Product.deleteMany();
    // await Category.deleteMany();
    await User.deleteMany();

    // The .create() method will automatically trigger the hashing middleware in userModel.js
    await User.create(users);

    console.log('✅✅✅ Data Imported Successfully! ✅✅✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
