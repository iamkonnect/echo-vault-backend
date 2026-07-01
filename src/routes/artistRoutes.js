const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// ============================================================================
// ARTIST API ENDPOINTS (JSON responses for Flutter frontend)
// Maps to Postman Collection: EchoVault_API_Testing.postman_collection.json
// ============================================================================

// All endpoints require authentication (Bearer token)
router.use(protect);
router.use(authorize(['ARTIST']));

// ============================================================================
// DASHBOARD - GET /api/artist/dashboard
// ============================================================================
// Returns: { totalPlays, totalEarnings, currentBalance, shorts, recentTransactions }
router.get('/dashboard', artistController.getArtistDashboard);

// ============================================================================
// MUSIC LIBRARY - GET /api/artist/music
// ============================================================================
// Returns artist's uploaded music (songs, videos, etc.)
// Response: { songs: [...], videos: [...], totalSongs, totalVideos }
router.get('/music', artistController.getArtistMusic);

// ============================================================================
// INSIGHTS - GET /api/artist/insights
// ============================================================================
// Returns artist insights and analytics
// Response: { totalPlays, totalEarnings, currentBalance, shorts, recentTransactions }
router.get('/insights', artistController.getArtistInsights);

// ============================================================================
// LIVE INSIGHTS - GET /api/artist/live-insights
// ============================================================================
// Returns live stream insights and real-time analytics
router.get('/live-insights', artistController.getLiveInsights);

// ============================================================================
// SHORTS INSIGHTS - GET /api/artist/shorts-insights
// ============================================================================
// Returns shorts-specific insights
router.get('/shorts-insights', artistController.getShortsInsights);

// ============================================================================
// EARNINGS - GET /api/artist/earnings
// ============================================================================
// Returns revenue data and earnings breakdown
// Response: { shortEarnings, liveEarnings, totalEarnings, breakdown }
router.get('/earnings', artistController.getEarningsBreakdown);

// ============================================================================
// WITHDRAWALS - GET /api/artist/withdrawals
// ============================================================================
// Returns withdrawal history
// Response: { withdrawals: [...], totalWithdrawn, pendingWithdrawals }
router.get('/withdrawals', artistController.getWithdrawalHistory);

// ============================================================================
// REQUEST WITHDRAWAL - POST /api/artist/withdraw
// ============================================================================
// Request a fund withdrawal
// Body: { amount: number }
// Response: { message, transaction }
router.post('/withdraw', artistController.requestWithdrawal);

// ============================================================================
// START LIVE STREAM - POST /api/artist/start-stream
// ============================================================================
// Start a new live stream
// Body: { title: string, thumbnail?: string }
// Response: { success, data: liveStream }
router.post('/start-stream', artistController.startLiveStream);

// ============================================================================
// STOP LIVE STREAM - POST /api/artist/stop-stream
// ============================================================================
// Stop an active live stream
// Body: { streamId: string }
// Response: { success, data: liveStream }
router.post('/stop-stream', artistController.stopLiveStream);

// ============================================================================
// MUSIC MANAGEMENT - PUT/DELETE
// ============================================================================

// Edit music metadata
// PUT /api/artist/music/{musicId}
router.put('/music/:musicId', artistController.editMusic);

// Delete music
// DELETE /api/artist/music/{musicId}
router.delete('/music/:musicId', artistController.deleteMusic);

// Get music statistics
// GET /api/artist/music/{musicId}/stats
router.get('/music/:musicId/stats', artistController.getMusicStats);

module.exports = router;
