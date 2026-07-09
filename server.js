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
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const tracksRoutes = require('./src/routes/tracksRoutes');
const liveStreamsRoutes = require('./src/routes/liveStreamsRoutes');
const giftingRoutes = require('./src/routes/giftingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const messagesRoutes = require('./src/routes/messagesRoutes');


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
app.set('views', '.'); // Set to root where your .ejs files currently reside

// DEBUG: Log ALL requests FIRST before any other middleware
app.use((req, res, next) => {
  console.log(`\n>>> REQUEST [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('>>> Authorization Header:', req.headers.authorization ? 'PRESENT' : 'MISSING');
  console.log('>>> Content-Type:', req.headers['content-type']);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Required to allow Tailwind CDN to load styles
}));

// CORS setup with comprehensive origins
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:*',
    'http://10.0.2.2:*',
    'https://echovault-frontend.eastus.azurecontainer.io',
    'https://*.azurecontainer.io',
    'https://echovault-backend.azurewebsites.net',
    'https://echovaultz.com',
    'https://admin.echovaultz.com',
    'https://www.echovaultz.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// DEBUG: Log body after parsing
app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.includes('/admin/gifts')) {
    console.log('>>> Body after parsing:', JSON.stringify(req.body));
  }
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ============ HEALTH CHECK ENDPOINT ============

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============ API ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/live', liveStreamsRoutes);
app.use('/api/gifting', giftingRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/payments', paymentRoutes);


// ============ DASHBOARD ROUTES ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/auth/login-dashboard-artist', require('./src/controllers/authController').loginDashboard);
app.post('/api/auth/login-dashboard-admin', require('./src/controllers/authController').loginDashboard);

// ============ 404 & ERROR HANDLING ============

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/live/streams',
      'GET /api/live/streams/active',
      'GET /api/gifting',
      'POST /api/gifting/send',
      'GET /api/payments/coin-packages'
    ]
  });
});

// Global error handler - must be last middleware
app.use(errorHandler);

// ============ SOCKET.IO SETUP ============

const setupSocketHandlers = require('./src/utils/socketHandlers');
const socketState = setupSocketHandlers(io);

// Handle socket errors
io.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

// ============ SERVER INITIALIZATION ============

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    // Start server
    server.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🎵 EchoVault Server Started           ║
╚════════════════════════════════════════╝
Environment: ${process.env.NODE_ENV || 'development'}
Host: http://${HOST}:${PORT}
Health: http://${HOST}:${PORT}/api/health
WebSocket: ws://${HOST}:${PORT}/socket.io
Database: Connected
Time: ${new Date().toISOString()}
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

// ============ GRACEFUL SHUTDOWN ============

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    // Close server
    server.close(async () => {
      // Disconnect database
      await prisma.$disconnect();
      console.log('✓ Database disconnected');
      console.log('✓ Server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('⚠ Forced shutdown after 10 seconds');
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, io, server };
