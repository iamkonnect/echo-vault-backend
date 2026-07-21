const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect } = require('../middlewares/authMiddleware');

// GET artist by ID with stats
router.get('/:id', async (req, res) => {
  try {
    const artist = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        username: true, 
        avatarUrl: true, 
        role: true, 
        isVerified: true,
        createdAt: true,
        _count: {
          select: { songs: true, shorts: true, videos: true }
        }
      }
    });
    
    if (!artist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Artist not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: artist 
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET artist's tracks
router.get('/:id/tracks', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const tracks = await prisma.song.findMany({
      where: { artistId: req.params.id },
      include: { 
        artist: { 
          select: { 
            id: true, 
            name: true, 
            username: true,
            avatarUrl: true
          } 
        } 
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.song.count({
      where: { artistId: req.params.id }
    });
    
    res.json({ 
      success: true, 
      data: tracks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching artist tracks:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
