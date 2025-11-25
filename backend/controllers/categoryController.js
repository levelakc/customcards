import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// @desc    Fetch all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    const categoriesWithFallbackNames = categories.map(category => ({
        ...category.toObject(),
        name: category.name.en || category.name.he,
    }));
    res.json(categoriesWithFallbackNames);
});

// @desc    Create a category
// @route   POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = new Category({ name });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (category) {
        category.name = name;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
        // In a real app, you might want to handle products in this category first
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

export { getCategories, createCategory, updateCategory, deleteCategory };
