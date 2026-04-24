const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../controllers/authMiddleware');
const artistController = require('../controllers/artistController');

// Apply auth middleware to all dashboard routes
router.use(protect);
router.use(authorize(['ARTIST']));

// Dashboard home
router.get('/api/artist/dashboard', artistController.getDashboard);

// My Music page
router.get('/api/artist/my-music', artistController.getMyMusicPage);

// Shorts Insights
router.get('/api/artist/shorts-insights', artistController.getShortsInsightsPage);

// Revenue page
router.get('/api/artist/revenue', artistController.getRevenuePage);

// Upload pages
router.get('/api/artist/upload/audio', artistController.getUploadAudio);
router.get('/api/artist/upload/video', artistController.getUploadVideo);
router.get('/api/artist/upload/shorts', artistController.getUploadShorts);

module.exports = router;
