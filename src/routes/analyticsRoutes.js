const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../controllers/authMiddleware');

// All analytics routes require admin authentication
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'REPORTS_MANAGER']));

// Get analytics data
router.get('/data', analyticsController.getAnalytics);

// Export routes
router.get('/export/csv', analyticsController.exportAnalyticsCSV);
router.get('/export/xml', analyticsController.exportAnalyticsXML);

module.exports = router;
