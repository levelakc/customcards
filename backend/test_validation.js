import mongoose from 'mongoose';
import Product from './models/productModel.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const test = async () => {
    try {
        await connectDB();
        const p = new Product({
            name: "test",
            description: "test",
            price: 100,
            image: "http://example.com/img.png",
            category: new mongoose.Types.ObjectId(),
            availableColors: ["black"],
            customization: { position: {x: 45, y: 10}, scale: 1, rotation: 0 },
            isUpsellProduct: false
        });
        await p.validate();
        console.log("Validation passed");
    } catch(e) {
        console.error("Validation failed:", e);
    }
    process.exit();
};

test();
