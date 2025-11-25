import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// --- MongoDB Connection Logic (adapted from db.js) ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('--- ❌ DATABASE CONNECTION FAILED ---');
        console.error(`Error: ${error.message}`);
        console.error('Please double-check your MONGO_URI in the .env file and ensure your IP is whitelisted in MongoDB Atlas.');
        console.error('------------------------------------');
        process.exit(1);
    }
};

// --- Models (adapted from categoryModel.js and productModel.js) ---
const categorySchema = mongoose.Schema({
    name: {
        en: { type: String, required: true },
        he: { type: String, required: true },
    },
}, { timestamps: true });
const Category = mongoose.model('Category', categorySchema);

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    price: { type: Number, required: true, default: 0 },
    availableColors: [{ type: String, required: true }],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    customization: {
        position: { x: { type: Number, default: 45 }, y: { type: Number, default: 10 } },
        scale: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 },
        engraveColors: [{ type: String }]
    },
    isUpsellProduct: { type: Boolean, default: false },
    
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);


// --- Inspection Logic ---
const inspectDb = async () => {
    await connectDB();

    console.log('\n--- Inspecting Categories ---');
    const categories = await Category.find({});
    if (categories.length === 0) {
        console.log('No categories found.');
    } else {
        categories.forEach(cat => {
            const missingEn = !cat.name.en || cat.name.en.trim() === '';
            console.log(`ID: ${cat._id}`);
            console.log(`  Name (EN): "${cat.name.en}" ${missingEn ? '(MISSING/EMPTY)' : ''}`);
            console.log(`  Name (HE): "${cat.name.he}"`);
            console.log('---');
        });
    }

    console.log('\n--- Inspecting Products ---');
    const products = await Product.find({}).populate('category', 'name.en name.he'); // Populate category names
    if (products.length === 0) {
        console.log('No products found.');
    } else {
        products.forEach(prod => {
            const missingName = !prod.name || prod.name.trim() === '';
            console.log(`ID: ${prod._id}`);
            console.log(`  Name: "${prod.name}" ${missingName ? '(MISSING/EMPTY)' : ''}`);
            console.log(`  Category (EN): "${prod.category.name.en}"`);
            console.log(`  Category (HE): "${prod.category.name.he}"`);
            console.log('---');
        });
    }

    mongoose.disconnect();
    console.log('\n--- Database inspection complete. MongoDB disconnected. ---');
};

insp ectDb();
