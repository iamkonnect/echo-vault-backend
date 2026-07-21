const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect } = require('../middlewares/authMiddleware');

// GET current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        username: true, 
        avatarUrl: true, 
        role: true, 
        isVerified: true, 
        walletBalance: true,
        phone: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET user's liked tracks (placeholder - implement when LikedTrack model is added)
router.get('/liked-tracks', protect, async (req, res) => {
  try {
    // TODO: Implement when LikedTrack model is added to schema
    res.json({ 
      success: true, 
      data: [],
      message: 'Feature coming soon'
    });
  } catch (error) {
    console.error('Error fetching liked tracks:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// UPDATE user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, username, phone, avatarUrl } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarUrl })
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarUrl: true,
        role: true
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: user 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
