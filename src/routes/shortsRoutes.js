const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/shorts - Get all shorts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const shorts = await prisma.short.findMany({
      include: {
        artist: {
          select: { 
            id: true, 
            name: true, 
            username: true,
            avatarUrl: true,
            isVerified: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.short.count();
    
    res.json({
      success: true,
      data: shorts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shorts:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/shorts/:id - Get single short
router.get('/:id', async (req, res) => {
  try {
    const short = await prisma.short.findUnique({
      where: { id: req.params.id },
      include: {
        artist: {
          select: { 
            id: true, 
            name: true, 
            username: true,
            avatarUrl: true,
            isVerified: true
          }
        }
      }
    });
    
    if (!short) {
      return res.status(404).json({ 
        success: false, 
        message: 'Short not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: short 
    });
  } catch (error) {
    console.error('Error fetching short:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST /api/shorts - Create a short (requires auth)
router.post('/', protect, async (req, res) => {
  try {
    const { title, videoUrl, thumbnailUrl, duration } = req.body;
    const userId = req.user.id;
    
    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title and videoUrl are required'
      });
    }
    
    const short = await prisma.short.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        artistId: userId,
        duration: Number.isFinite(Number(duration)) ? Number(duration) : 0
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Short created successfully',
      data: short
    });
  } catch (error) {
    console.error('Error creating short:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST /api/shorts/:id/like - Like a short
router.post('/:id/like', protect, async (req, res) => {
  try {
    // TODO: Implement like when ShortLike model is added
    res.json({ 
      success: true, 
      message: 'Short liked' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
