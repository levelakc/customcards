import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('category'); // Removed 'name' from populate to handle it manually

    const productsWithFallbackNames = products.map(product => {
        const categoryName = product.category ? (product.category.name.en || product.category.name.he) : undefined;
        return {
            ...product.toObject(),
            name: product.name.en || product.name.he,
            category: categoryName ? {
                ...product.category.toObject(),
                name: categoryName
            } : undefined
        };
    });
    res.json(productsWithFallbackNames);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); // Removed 'name' from populate to handle it manually
    if (product) {
        const categoryName = product.category ? (product.category.name.en || product.category.name.he) : undefined;
        res.json({
            ...product.toObject(),
            name: product.name.en || product.name.he,
            category: categoryName ? {
                ...product.category.toObject(),
                name: categoryName
            } : undefined
        });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Create a product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
    // Destructure the new customization field from the request body
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;

    // If this product is marked as an upsell, ensure no others are
    if (isUpsellProduct) {
        await Product.updateMany({}, { $set: { isUpsellProduct: false } });
    }

    const product = new Product({
        name: {
            en: name.en || name.he, // Use en if available, otherwise he
            he: name.he
        },
        price,
        description,
        image,
        category,
        availableColors,
        customization, // Add customization data to the new product
        isUpsellProduct,
    });
    const createdProduct = await product.save();
    res.status(201).json({
        ...createdProduct.toObject(),
        name: createdProduct.name.en || createdProduct.name.he,
    });
});

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    // Destructure the new customization field from the request body
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // If this product is being marked as the upsell, ensure no others are
        if (isUpsellProduct && !product.isUpsellProduct) {
            await Product.updateMany({ _id: { $ne: product._id } }, { $set: { isUpsellProduct: false } });
        }

        product.name = {
            en: name.en || name.he, // Use en if available, otherwise he
            he: name.he
        };
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.availableColors = availableColors;
        product.customization = customization; // Update customization data
        product.isUpsellProduct = isUpsellProduct;
        
        const updatedProduct = await product.save();
        res.json({
            ...updatedProduct.toObject(),
            name: updatedProduct.name.en || updatedProduct.name.he,
        });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Get the single upsell product
// @route   GET /api/products/upsell
const getUpsellProduct = asyncHandler(async (req, res) => {
    const upsellProduct = await Product.findOne({ isUpsellProduct: true }).populate('category'); // Removed 'name' from populate
    if (upsellProduct) {
        const categoryName = upsellProduct.category ? (upsellProduct.category.name.en || upsellProduct.category.name.he) : undefined;
        res.json({
            ...upsellProduct.toObject(),
            name: upsellProduct.name.en || upsellProduct.name.he,
            category: categoryName ? {
                ...upsellProduct.category.toObject(),
                name: categoryName
            } : undefined
        });
    } else {
        // It's okay if none is found, the frontend can handle this
        res.status(404).json({ message: 'No upsell product found' });
    }
});

// @desc    Search products
// @route   GET /api/products/search
const searchProducts = asyncHandler(async (req, res) => {
    const { keyword, minPrice, maxPrice, color, engraveColor } = req.query;
    let query = {};

    if (keyword) {
        query.$or = [
            { 'name.en': { $regex: keyword, $options: 'i' } },
            { 'name.he': { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (color) {
        query.availableColors = { $in: [color] };
    }

    if (engraveColor) {
        // Assuming engraveColor is part of customization.engraveColors array
        query['customization.engraveColors'] = { $in: [engraveColor] };
    }

    const products = await Product.find(query).populate('category'); // Removed 'name' from populate to handle it manually

    const productsWithFallbackNames = products.map(product => {
        const categoryName = product.category ? (product.category.name.en || product.category.name.he) : undefined;
        return {
            ...product.toObject(),
            name: product.name.en || product.name.he,
            category: categoryName ? {
                ...product.category.toObject(),
                name: categoryName
            } : undefined
        };
    });
    res.json(productsWithFallbackNames);
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview,
    getUpsellProduct,
    searchProducts
};