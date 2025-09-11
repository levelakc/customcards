// backend/config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...'); // New log
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`); // Success message
    } catch (error) {
        // This will now print a very clear error message if it fails
        console.error('--- ❌ DATABASE CONNECTION FAILED ---');
        console.error(`Error: ${error.message}`);
        console.error('Please double-check your MONGO_URI in the .env file and ensure your IP is whitelisted in MongoDB Atlas.');
        console.error('------------------------------------');
        process.exit(1); // Exit with a failure code
    }
};

export default connectDB;