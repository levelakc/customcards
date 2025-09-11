import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js'; // <- ADD THIS LINE

// Initial setup
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

const corsOptions = {
  origin: 'https://customcards-app.onrender.com' // Replace with your actual frontend URL
};

app.use(cors(corsOptions)); // Use the cors middleware


// Base route
app.get('/', (req, res) => res.send('API is running...'));

// Use the API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', siteSettingsRoutes);
app.use('/api/config', paymentRoutes);
app.use('/api/gallery', galleryRoutes); // <- ADD THIS LINE

// This correctly determines the path to the current directory in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This tells Express to serve the 'uploads' folder as a static directory, making images accessible
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Server port setup
const PORT = process.env.PORT || 8000; // Changed from 5000 to 8000 to match your setup
app.listen(PORT, console.log(`Server running on port ${PORT}`));
