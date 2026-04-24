const express = require('express');
const { register, registerDashboard, login, loginDashboard, logout, refreshToken, verifyAuth } = require('../controllers/authController');
const { protect } = require('../controllers/authMiddleware');
const router = express.Router();

// GET route to render the professional login page
router.get('/login', (req, res) => {
  res.render('auth');
});

// GET route to render the artist registration form
router.get('/register', (req, res) => {
  res.render('artist-register');
});

router.post('/register', register);
router.post('/register-dashboard', registerDashboard); // Artist registration from dashboard - redirects
router.post('/login', login);
router.post('/login-dashboard', loginDashboard);
router.post('/logout', logout);

// ============ TOKEN MANAGEMENT ============

// Refresh token endpoint (send old token, get new one)
router.post('/refresh', refreshToken);

// Verify token endpoint (check if currently authenticated)
router.post('/verify', protect, verifyAuth);

module.exports = router;
