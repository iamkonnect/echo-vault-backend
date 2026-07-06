const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { verifyToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// Admin Dashboard - PROTECTED (requires auth)
router.get('/dashboard', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const stats = {
      revenue: 0,
      userCount: 0,
      artistCount: 0,
      withdrawals: [],
      topArtists: [],
      topVideos: [],
      topShorts: [],
      topStreams: [],
      reportsCount: 0
    };
    
    const user = req.user; // Get authenticated user from middleware
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(stats);
    }
    
    res.render('admin-dashboard', { stats, user });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading dashboard data' });
  }
});

// User Management - page rendering
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        isOnline: true,
        lastLogin: true,
        lastLoginIp: true,
        lastLoginRegion: true,
        createdAt: true,
        _count: {
          select: {
            songs: true,
            shorts: true,
          }
        }
      },
      orderBy: { lastLogin: 'desc' },
    });

    res.render('admin-user-directory', { users, user: null });
  } catch (error) {
    console.error('Users page error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Management - API JSON response
router.get('/users/api', protect, authorize(['ADMIN']), adminController.getAllUsersApi);
router.get('/users/:id', protect, authorize(['ADMIN']), adminController.getUserDetail);

// ============================================================================
// CREATE ADMIN - GET form (with token in URL)
// ============================================================================
router.get('/create-admin', async (req, res) => {
  try {
    let user = null;
    let token = req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]) || (req.cookies && req.cookies.token);
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true }
        });
        
        if (!user || user.role !== 'ADMIN') {
          return res.status(403).json({ message: 'Admin access required' });
        }
      } catch (e) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    } else {
      return res.status(401).json({ message: 'Token required' });
    }
    
    const roles = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
    const error = req.query.error || null;
    const success = req.query.success || null;
    
    res.render('admin-create-admin', { roles, user, error, success });
  } catch (error) {
    console.error('Error rendering create admin form:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================================================
// CREATE ADMIN - POST (Returns JSON only, no HTML rendering)
// ============================================================================
router.post('/create-admin', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, username, password, confirmPassword, phone, role } = req.body;
    const rolesArray = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
    
    // Validate input
    if (!name || !email || !username || !password || !confirmPassword || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'All required fields must be filled'
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({ 
        success: false, 
        error: `This ${field} is already in use`
      });
    }

    // Validate role
    if (!rolesArray.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role selected'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin in database
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        role: role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });
    
    console.log(`✅ New admin created: ${newAdmin.name} (${newAdmin.role}) by ${req.user.email}`);
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: `Admin user '${newAdmin.name}' with role '${newAdmin.role}' created successfully`,
      data: newAdmin
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create admin user'
    });
  }
});

// ============================================================================
// CREATE ADMIN - API endpoint (alternative route, same logic)
// ============================================================================
router.post('/api/create-admin', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, username, password, confirmPassword, phone, role } = req.body;
    const rolesArray = ['ADMIN', 'MANAGER', 'REPORTS_MANAGER', 'ACCOUNTS', 'SUPPORT', 'CONTENT_MODERATOR', 'ANALYST'];
    
    if (!name || !email || !username || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({ success: false, error: `This ${field} is already in use` });
    }

    if (!rolesArray.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role selected' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: { name, email, username, password: hashedPassword, phone: phone || null, role },
      select: { id: true, name: true, email: true, username: true, role: true, phone: true, createdAt: true }
    });
    
    console.log(`✅ New admin created: ${newAdmin.name} (${newAdmin.role}) by ${req.user.email}`);
    
    return res.status(201).json({
      success: true,
      message: `Admin user '${newAdmin.name}' with role '${newAdmin.role}' created successfully`,
      data: newAdmin
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create admin user' });
  }
});

// Artist Verification Routes
router.get('/artist-verification', async (req, res) => {
  try {
    const artists = await adminController.getUnverifiedArtistsData();
    const formattedArtists = artists.map(artist => ({
      ...artist,
      contentCount: (artist._count.songs || 0) + (artist._count.shorts || 0),
      giftCount: artist._count.giftsReceived || 0,
    }));
    
    res.render('admin-artist-verification', { artists: formattedArtists, user: null });
  } catch (error) {
    console.error('Error fetching unverified artists:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/artist-verification/api', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const artists = await adminController.getUnverifiedArtistsData();
    res.json(artists);
  } catch (error) {
    console.error('Error fetching unverified artists:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/artist/:id/verify', protect, authorize(['ADMIN']), adminController.verifyArtist);
router.post('/artist/:id/reject', protect, authorize(['ADMIN']), adminController.rejectArtist);

// Management Pages
router.get('/music-management', async (req, res) => {
  try {
    res.render('admin-music-management', { user: null, stats: { songs: 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/video-management', async (req, res) => {
  try {
    res.render('admin-video-management', { user: null, stats: { videos: 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/shorts-management', async (req, res) => {
  try {
    res.render('admin-shorts-management', { user: null, stats: { shorts: 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/ads-management', async (req, res) => {
  try {
    res.render('admin-ads-management', { user: null, stats: { ads: 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/slider-management', async (req, res) => {
  try {
    res.render('admin-slider-management', { user: null, stats: { sliders: 0 } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payout management routes
const payoutController = require('../controllers/adminPayoutController');

router.get('/payouts', async (req, res) => {
  try {
    res.render('admin-payouts', { 
      user: null,
      totalRevenue: 0,
      revenueBreakdown: { gifts: 0, music: 0, live: 0, ads: 0 },
      totalPending: 0,
      totalPaidOut: 0,
      availableRevenue: 0,
      withdrawals: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/gifts', async (req, res) => {
  try {
    res.render('admin-gifts', { user: null, gifts: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Gift creation route - CREATE GiftTemplate in database
router.post('/gifts/create', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, price, actualAmount, icon } = req.body;
    
    if (!name || !price || !actualAmount) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, price, actualAmount' });
    }

    // Create gift template in database
    const newGift = await prisma.giftTemplate.create({
      data: {
        name: name,
        amount: parseFloat(actualAmount),
        price: parseFloat(price),
        icon: icon || '🎁',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        price: true,
        icon: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(`✅ New gift template created: ${newGift.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Gift created successfully',
      data: newGift,
    });
  } catch (error) {
    console.error('Gift creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create gift', error: error.message });
  }
});

// GET API endpoint to fetch all gifts (for admin management)
router.get('/gifts/api', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({
      orderBy: { amount: 'asc' },
      select: {
        id: true,
        name: true,
        amount: true,
        price: true,
        icon: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: gifts,
      count: gifts.length,
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gifts', error: error.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    res.render('admin-reports', { 
      user: null,
      reports: [],
      stats: { totalReports: 0, pendingReports: 0, resolvedReports: 0, flaggedUsers: 0 },
      reportsByCategory: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/payouts/:id/approve', protect, authorize(['ADMIN']), payoutController.approvePayout);
router.post('/payouts/:id/reject', protect, authorize(['ADMIN']), payoutController.rejectPayout);
router.post('/platform-withdraw', protect, authorize(['ADMIN']), payoutController.platformWithdraw);

module.exports = router;
