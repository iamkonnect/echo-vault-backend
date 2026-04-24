const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../controllers/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(authorize(['ADMIN']));

// Admin Dashboard - can be accessed as page or API
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await adminController.getPlatformStats(req, { json: (data) => data });
    
    // If it's an API request (Accept: application/json), return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(stats);
    }
    
    // Otherwise render the dashboard page
    res.render('admin-dashboard', { stats, user: req.user });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading dashboard data' });
  }
});

// User Management - page rendering (accessed from sidebar)
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

    res.render('admin-user-directory', { users });
  } catch (error) {
    console.error('Users page error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Management - API JSON response
router.get('/users/api', adminController.getAllUsersApi);

router.get('/users/:id', adminController.getUserDetail);
router.get('/create-admin', adminController.renderCreateAdminForm);
router.post('/create-admin', adminController.createAdminUser);

// Artist Verification Routes - page rendering (must be before /api)
router.get('/artist-verification', async (req, res) => {
  try {
    const artists = await adminController.getUnverifiedArtistsData();
    
    // Format data for rendering
    const formattedArtists = artists.map(artist => ({
      ...artist,
      contentCount: (artist._count.songs || 0) + (artist._count.shorts || 0),
      giftCount: artist._count.giftsReceived || 0,
    }));
    
    res.render('admin-artist-verification', { artists: formattedArtists });
  } catch (error) {
    console.error('Error fetching unverified artists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Artist Verification Routes - API JSON response
router.get('/artist-verification/api', async (req, res) => {
  try {
    const artists = await adminController.getUnverifiedArtistsData();
    res.json(artists);
  } catch (error) {
    console.error('Error fetching unverified artists:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/artist/:id/verify', adminController.verifyArtist);
router.post('/artist/:id/reject', adminController.rejectArtist);

// Payout management routes
const payoutController = require('../controllers/adminPayoutController');
router.get('/payouts', require('../controllers/adminController').renderPayoutsPage);
router.post('/payouts/:id/approve', payoutController.approvePayout);
router.post('/payouts/:id/reject', payoutController.rejectPayout);
router.post('/platform-withdraw', payoutController.platformWithdraw);

module.exports = router;
