import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('category');
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Create a product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;

    if (isUpsellProduct) {
        await Product.updateMany({}, { $set: { isUpsellProduct: false } });
    }

    const product = new Product({
        name,
        price,
        description,
        image,
        category,
        availableColors,
        customization,
        isUpsellProduct,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        if (isUpsellProduct && !product.isUpsellProduct) {
            await Product.updateMany({ _id: { $ne: product._id } }, { $set: { isUpsellProduct: false } });
        }

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.availableColors = availableColors;
        product.customization = customization;
        product.isUpsellProduct = isUpsellProduct;
        
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Get the single upsell product
// @route   GET /api/products/upsell
const getUpsellProduct = asyncHandler(async (req, res) => {
    const upsellProduct = await Product.findOne({ isUpsellProduct: true }).populate('category');
    if (upsellProduct) {
        res.json(upsellProduct);
    } else {
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
            { name: { $regex: keyword, $options: 'i' } },
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
        query['customization.engraveColors'] = { $in: [engraveColor] };
    }

    const products = await Product.find(query).populate('category');
    res.json(products);
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
