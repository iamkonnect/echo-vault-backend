const express = require('express');
const { register, registerDashboard, login, loginDashboard, logout, refreshToken, verifyAuth, sendVerificationEmail, verifyEmail, forgotPassword, resetPassword, upgradeToArtist } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const passport = require('../utils/oauth');
const router = express.Router();

// GET route to render the professional login page
router.get('/login', (req, res) => {
  res.render('auth');
});

// GET route to render the artist registration form
router.get('/register', (req, res) => {
  res.render('artist-register');
});

// ============ LOCAL AUTHENTICATION ============

router.post('/register', register);
router.post('/register-dashboard', registerDashboard);
router.post('/login', login);
router.post('/login-dashboard', loginDashboard);
router.post('/logout', logout);

// ============ EMAIL VERIFICATION ============

// Send verification email
router.post('/send-verification', protect, sendVerificationEmail);

// Verify email token (GET for browser link clicks)
router.get('/verify-email/:token', verifyEmail);

// Verify email token (POST for API calls)
router.post('/verify-email/:token', verifyEmail);

// ============ PASSWORD RESET ============

// Request password reset (sends email)
router.post('/forgot-password', forgotPassword);

// Render reset password form (GET for browser link clicks)
router.get('/reset-password/:token', resetPassword);

// Submit new password (POST)
router.post('/reset-password/:token', resetPassword);

// ============ TOKEN MANAGEMENT ============

router.post('/refresh', refreshToken);
router.post('/verify', protect, verifyAuth);
router.post('/upgrade-artist', protect, upgradeToArtist);

// ============ OAUTH - GOOGLE ============

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.BASE_URL || 'https://admin.echovaultz.com'}/login?error=google_auth_failed` 
  }),
  (req, res) => {
    const token = req.user.oauthToken;
    const appUrl = process.env.CLIENT_URL || 'https://echovaultz.com';
    // Redirect back to the app with the token
    res.redirect(`${appUrl}/auth/callback?token=${token}&provider=google`);
  }
);

// ============ OAUTH - APPLE ============

// Initiate Apple OAuth
router.get('/apple', passport.authenticate('apple', {
  session: false
}));

// Apple OAuth callback
router.post('/apple/callback', 
  (req, res, next) => {
    passport.authenticate('apple', { 
      session: false, 
      failureRedirect: `${process.env.BASE_URL || 'https://admin.echovaultz.com'}/login?error=apple_auth_failed`
    })(req, res, next);
  },
  (req, res) => {
    const token = req.user.oauthToken;
    const appUrl = process.env.CLIENT_URL || 'https://echovaultz.com';
    res.redirect(`${appUrl}/auth/callback?token=${token}&provider=apple`);
  }
);

module.exports = router;
</create_file>
