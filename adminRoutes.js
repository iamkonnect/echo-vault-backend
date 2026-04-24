const express = require('express');
const router = express.Router();
const adminController = require('./src/controllers/adminController');
const { protect, authorize } = require('./src/controllers/authMiddleware');
const { uploadImage, uploadGiftIcon } = require('./multerConfig');

// Apply authentication to all admin routes
router.use(protect);
router.use(authorize([
  'ADMIN', 
  'SUPER_ADMIN', 
  'MANAGER', 
  'REPORTS_MANAGER', 
  'ACCOUNTS', 
  'SUPPORT', 
  'CONTENT_MODERATOR', 
  'ANALYST'
]));

// Dashboard - main page
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await adminController.getPlatformStats();
    res.render('admin-dashboard', { user: req.user, stats });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

// Redirect root admin to dashboard
router.get('/', (req, res) => {
  res.redirect('/api/admin/dashboard');
});

// User Directory
router.get('/users', async (req, res) => {
  try {
    const users = await adminController.getAllUsersForPage();
    const stats = await adminController.getPlatformStats();
    res.render('admin-user-directory', { user: req.user, users, stats });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

// Artist Verification
router.get('/artist-verification', adminController.getUnverifiedArtists);

// Create Admin Form
router.get('/create-admin', adminController.renderCreateAdminForm);
router.post('/create-admin', adminController.createAdminUser);

// Payouts
router.get('/payouts', adminController.renderPayoutsPage);

// Gift Management - GET list
router.get('/gifts', async (req, res) => {
  try {
    const prisma = require('./src/utils/prisma');
    const gifts = await prisma.giftTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const stats = await adminController.getPlatformStats();
    const success = req.query.success || null;
    res.render('admin-gifts', { user: req.user, gifts, stats, success });
  } catch (error) {
    console.error('Error loading gifts:', error);
    res.status(500).render('error', { message: error.message });
  }
});

// Gift Management - POST create with file upload for GIF/PNG icons
router.post('/gifts/create', uploadGiftIcon.single('icon'), async (req, res) => {
  try {
    const prisma = require('./src/utils/prisma');
    const { name, price, actualAmount, artistShare, creatorShare, adminShare } = req.body;
    
    if (!name || !req.file || price === undefined || actualAmount === undefined) {
      return res.status(400).render('error', { message: 'Missing required fields. Icon file (GIF or PNG) is required.' });
    }

    // Validate file type
    const validMimeTypes = ['image/gif', 'image/png'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).render('error', { message: 'Only GIF and PNG files are allowed for icons.' });
    }

    // Construct the icon URL path for serving via express.static
    const iconPath = `/uploads/images/${req.file.filename}`;

    const gift = await prisma.giftTemplate.create({
      data: {
        name,
        icon: iconPath,
        price: parseFloat(price),
        actualAmount: parseFloat(actualAmount),
        artistShare: artistShare ? parseFloat(artistShare) / 100 : 0.4,
        creatorShare: creatorShare ? parseFloat(creatorShare) / 100 : 0.4,
        adminShare: adminShare ? parseFloat(adminShare) / 100 : 0.2,
      },
    });
    res.redirect('/api/admin/gifts?success=Gift created successfully');
  } catch (error) {
    console.error('Error creating gift:', error);
    res.status(500).render('error', { message: error.message });
  }
});

// Gift Management - POST delete
router.post('/gifts/:id/delete', async (req, res) => {
  try {
    const prisma = require('./src/utils/prisma');
    const { id } = req.params;
    
    await prisma.giftTemplate.update({
      where: { id },
      data: { isActive: false },
    });
    res.redirect('/api/admin/gifts?success=Gift removed successfully');
  } catch (error) {
    console.error('Error deleting gift:', error);
    res.status(500).render('error', { message: error.message });
  }
});

// Reports
router.get('/reports', adminController.renderReportsPage);

// User Detail View
router.get('/users/:id', adminController.getUserDetail);

// API Endpoints for verification
router.post('/verify-artist/:id', adminController.verifyArtist);
router.post('/reject-artist/:id', adminController.rejectArtist);

// Report management APIs
router.post('/report/:id/resolve', adminController.resolveReport);
router.post('/report/:id/dismiss', adminController.dismissReport);
router.post('/user/:id/ban', adminController.banUser);

// API endpoint to get all users
router.get('/api/users', adminController.getAllUsersApi);

// Payout management endpoints
router.post('/payout/:transactionId/approve', adminController.approvePayout);
router.post('/payout/:transactionId/reject', adminController.rejectPayout);
router.post('/withdraw-to-bank', adminController.withdrawToBank);
router.post('/request-withdrawal', adminController.requestWithdrawal);

module.exports = router;
