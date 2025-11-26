import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// @desc    Fetch all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
    const lang = req.headers['accept-language'] && req.headers['accept-language'].startsWith('he') ? 'he' : 'en';
    const categories = await Category.find({});
    const categoriesWithLocalizedNames = categories.map(category => {
        const categoryName = category.name[lang] || category.name['en'] || category.name['he'] || '';
        return {
            ...category.toObject(),
            name: categoryName,
        };
    });
    res.json(categoriesWithLocalizedNames);
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


// @desc    Get category by ID
// @route   GET /api/categories/:id
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

export { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById };
