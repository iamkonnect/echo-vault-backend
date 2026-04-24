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

const authRoutes = require('./src/routes/authRoutes');
const artistRoutes = require('./artistRoutes');
const adminRoutes = require('./adminRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const tracksRoutes = require('./src/routes/tracksRoutes');
const liveStreamsRoutes = require('./src/routes/liveStreamsRoutes');
const { protect } = require('./src/controllers/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:*',
      'http://10.0.2.2:*'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', '.'); // Set to root where your .ejs files currently reside

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Required to allow Tailwind CDN to load styles
}));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:*',
    'http://10.0.2.2:*',
    'http://*:*'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse form data from the dashboard login
app.use(morgan('dev'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/artist', protect, artistRoutes);
app.use('/api/admin', protect, adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tracks', tracksRoutes);
app.use('/api/live', liveStreamsRoutes);

// Split-screen login portal (serves index.html from public folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard redirects - use original loginDashboard endpoint logic
// These handle the redirects after split-login form submission
app.post('/api/auth/login-dashboard-artist', require('./src/controllers/authController').loginDashboard);
app.post('/api/auth/login-dashboard-admin', require('./src/controllers/authController').loginDashboard);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// Socket.io for real-time gifts and live streaming
const setupSocketHandlers = require('./src/utils/socketHandlers');
const socketState = setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

// Verify DB connection before starting server
prisma.$connect().then(() => {
  server.listen(PORT, () => {
    console.log(`EchoVault Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
