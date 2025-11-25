import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/categoryModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const migrateCategories = async () => {
  try {
    const categories = await Category.find({});
    for (const category of categories) {
      if (typeof category.name === 'string') {
        category.name = {
          en: category.name,
          he: category.name,
        };
        await category.save();
        console.log(`Migrated category: ${category._id}`);
      }
    }
    console.log('✅✅✅ Category migration completed successfully! ✅✅✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

migrateCategories();
