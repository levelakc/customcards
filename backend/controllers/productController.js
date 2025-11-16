import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    const products = await Product.find({}).populate('category', 'name');
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
    // Destructure the new customization field from the request body
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;

    // If this product is marked as an upsell, ensure no others are
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
        customization, // Add customization data to the new product
        isUpsellProduct,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    // Destructure the new customization field from the request body
    const { name, price, description, image, category, availableColors, customization, isUpsellProduct } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // If this product is being marked as the upsell, ensure no others are
        if (isUpsellProduct && !product.isUpsellProduct) {
            await Product.updateMany({ _id: { $ne: product._id } }, { $set: { isUpsellProduct: false } });
        }

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.category = category;
        product.availableColors = availableColors;
        product.customization = customization; // Update customization data
        product.isUpsellProduct = isUpsellProduct;
        
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Get the single upsell product
// @route   GET /api/products/upsell
const getUpsellProduct = async (req, res) => {
    const upsellProduct = await Product.findOne({ isUpsellProduct: true });
    if (upsellProduct) {
        res.json(upsellProduct);
    } else {
        // It's okay if none is found, the frontend can handle this
        res.status(404).json({ message: 'No upsell product found' });
    }
};

// @desc    Search products
// @route   GET /api/products/search
const searchProducts = async (req, res) => {
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
        // Assuming engraveColor is part of customization.engraveColors array
        query['customization.engraveColors'] = { $in: [engraveColor] };
    }

    try {
        const products = await Product.find(query).populate('category', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
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
};

export { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview,
    getUpsellProduct,
    searchProducts // Export the new searchProducts function
};