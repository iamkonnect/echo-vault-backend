require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const prisma = require('./src/utils/prisma');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const artistRoutes = require('./src/routes/artistRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const giftManagementRoutes = require('./src/routes/giftManagementRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const tracksRoutes = require('./src/routes/tracksRoutes');
const liveStreamsRoutes = require('./src/routes/liveStreamsRoutes');
const giftingRoutes = require('./src/routes/giftingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const messagesRoutes = require('./src/routes/messagesRoutes');
const paymentsRoutes = require('./src/routes/paymentsRoutes');
const artistsRoutes = require('./src/routes/artistsRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adsRoutes = require('./src/routes/adsRoutes');
const playlistsRoutes = require('./src/routes/playlistsRoutes');
const albumsRoutes = require('./src/routes/albumsRoutes');
const shortsRoutes = require('./src/routes/shortsRoutes');

// Import middleware
const { protect } = require('./src/middlewares/authMiddleware');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const server = http.createServer(app);

// Socket.io setup with proper CORS
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:*',
      'http://10.0.2.2:*',
      'https://echovault-frontend.eastus.azurecontainer.io',
      'https://*.azurecontainer.io',
      'https://echovaultz.com',
      'https://admin.echovaultz.com',
      'https://www.echovaultz.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// ============ MIDDLEWARE SETUP ============

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', '.');

// DEBUG: Log ALL requests
app.use((req, res, next) => {
  console.log(`\n>>> REQUEST [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('>>> Authorization Header:', req.headers.authorization ? 'PRESENT' : 'MISSING');
  console.log('>>> Content-Type:', req.headers['content-type']);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS setup
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:*',
    'https://echovaultz.com',
    'https://admin.echovaultz.com',
    'https://www.echovaultz.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============ ROUTES ============

// Auth routes
app.use('/api/auth', authRoutes);

// Artist routes
app.use('/api/artist', artistRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Gift management (CRUD operations)
app.use('/api/admin', giftManagementRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Tracks routes
app.use('/api/tracks', tracksRoutes);

// Live streams routes
app.use('/api/live', liveStreamsRoutes);

// Shorts routes
app.use('/api/shorts', shortsRoutes);

// Gifting routes (public endpoints - send/list)
app.use('/api/gifting', giftingRoutes);

// Artists routes
app.use('/api/artists', artistsRoutes);

// User routes
app.use('/api/user', userRoutes);

// Payments routes (use paymentsRoutes, not paymentRoutes)
app.use('/api/payments', paymentsRoutes);

// Ads routes
app.use('/api/ads', adsRoutes);

// Playlists routes
app.use('/api/playlists', playlistsRoutes);

// Albums routes
app.use('/api/albums', albumsRoutes);

// Messages routes
app.use('/api/messages', messagesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EchoVault API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler middleware
app.use(errorHandler);

// ============ SOCKET.IO SETUP ============

io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Make io accessible to route handlers
app.set('io', io);

// ============ SERVER START ============

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 EchoVault Backend Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(50)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

module.exports = { app, server, io };
