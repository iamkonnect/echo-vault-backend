const express = require('express');
const router = express.Router();
const artistController = require('./src/controllers/artistController');
const { protect, authorize } = require('./src/controllers/authMiddleware');
const { uploadAudio, uploadVideo, uploadImage } = require('./multerConfig');

// Apply authentication to all artist routes
router.use(protect);
router.use(authorize(['ARTIST']));

// Dashboard routes - Render pages
router.get('/dashboard', artistController.renderDashboard);
router.get('/my-music', artistController.renderMyMusicPage);
router.get('/live-insights', artistController.renderLiveInsightsPage);
router.get('/shorts-insights', artistController.renderShortsInsightsPage);
router.get('/revenue', artistController.renderRevenuePage);
router.get('/', (req, res) => res.redirect('/api/artist/dashboard'));

// Upload pages (GET to render forms)
router.get('/upload/audio', artistController.renderUploadAudioPage);
router.get('/upload/video', artistController.renderUploadVideoPage);
router.get('/upload/shorts', artistController.renderUploadShortsPage);

// Upload handlers (POST to save data)
router.post('/upload/audio', uploadAudio.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'coverArt', maxCount: 1 }]), artistController.handleUploadAudio);
router.post('/upload/video', uploadVideo.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), artistController.handleUploadVideo);
router.post('/upload/shorts', uploadVideo.fields([{ name: 'shortFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), artistController.handleUploadShorts);

module.exports = router;