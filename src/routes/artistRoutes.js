const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { protect, authorize } = require('../controllers/authMiddleware');

// Protect all artist routes - only ARTIST role can access
router.use(protect);
router.use(authorize(['ARTIST']));

// Get artist insights (stats, earnings, etc.)
router.get('/insights', artistController.getArtistInsights);

// Get artist's music library (songs, videos)
router.get('/music', artistController.getArtistMusic);

// Get earnings breakdown
router.get('/earnings', artistController.getEarningsBreakdown);

// Get withdrawal history
router.get('/withdrawals', artistController.getWithdrawalHistory);

// Upload music (song)
// Note: Requires multipart/form-data with file and title, duration fields
router.post('/upload-music', artistController.uploadMusic);

// Upload short video
router.post('/upload-short', artistController.uploadShort);

// Request withdrawal
router.post('/withdraw', artistController.requestWithdrawal);

module.exports = router;
