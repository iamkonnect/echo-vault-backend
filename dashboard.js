const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('./middleware/auth'); // Fixed path if file is in root

const ROLES = {
  ADMIN: 'ADMIN',
  ARTIST: 'ARTIST'
};

// Middleware to restrict access by role
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    const userRole = (req.user.role || '').toUpperCase();
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ message: `Forbidden: Access restricted to ${roles.join(' or ')}` });
    }
    next();
  };
};

// Admin Central Dashboard: http://localhost:5000/admin/dashboard
router.get('/admin/dashboard', authenticateJWT, authorize([ROLES.ADMIN]), (req, res) => {
  res.json({
    success: true,
    message: "Welcome to EchoVault Admin Central",
    adminInfo: {
      name: req.user.name,
      email: req.user.email,
      accessLevel: "FULL_SYSTEM_CONTROL"
    },
    data: {
      systemStats: { activeArtists: 1, totalRevenue: 1250.5 }
    }
  });
});

// Artist Dashboard: http://localhost:5000/artist/dashboard
router.get('/artist/dashboard', authenticateJWT, authorize([ROLES.ARTIST]), (req, res) => {
  res.json({
    success: true,
    message: "Artist Dashboard Access Granted",
    data: {
      artist: req.user.name,
      walletBalance: req.user.walletBalance,
      stats: { streams: 5000, monthlyListeners: 120 }
    }
  });
});

module.exports = router;