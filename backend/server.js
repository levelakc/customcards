import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import http from 'http';
import { Server } from 'socket.io';

// Route imports
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Initial setup
dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://customcards-app.onrender.com', // Production frontend
      'http://localhost:3000', // Local frontend for development
      'https://vip-card.co.il'
    ],
    methods: ['GET', 'POST']
  }
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('onlineUsers', onlineUsers);
  console.log('a user connected, total online users:', onlineUsers);

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('onlineUsers', onlineUsers);
    console.log('user disconnected, total online users:', onlineUsers);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());

const corsOptions = {
  origin: [
    'https://customcards-app.onrender.com', // Production frontend
    'http://localhost:3000', // Local frontend for development
    'https://vip-card.co.il'
  ]
};

app.use(cors(corsOptions));

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
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 8000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));


// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
