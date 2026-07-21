const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// ?? IMPORTANT: Specific routes MUST come BEFORE generic routes
// Otherwise /tracks/featured will match /:id

// GET featured tracks (MUST be before /:id)
router.get('/featured', async (req, res) => {
  try {
    const tracks = await prisma.song.findMany({
      include: {
        artist: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET trending tracks (MUST be before /:id)
router.get('/trending', async (req, res) => {
  try {
    const tracks = await prisma.song.findMany({
      include: {
        artist: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET recommendations (MUST be before /:id)
router.get('/recommendations', async (req, res) => {
  try {
    const tracks = await prisma.song.findMany({
      include: {
        artist: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SEARCH tracks (MUST be before /:id)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }
    const tracks = await prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { artist: { name: { contains: q, mode: 'insensitive' } } }
        ]
      },
      include: {
        artist: { select: { id: true, name: true, username: true, avatarUrl: true } }
      },
      take: 50
    });
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET tracks by genre (MUST be before /:id)
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const tracks = await prisma.song.findMany({
      where: { genre: { contains: genre, mode: 'insensitive' } },
      include: {
        artist: { select: { id: true, name: true, username: true, avatarUrl: true } }
      },
      take: 20
    });
    res.json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NOW the generic routes

// GET all tracks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const tracks = await prisma.song.findMany({
      include: {
        artist: { select: { id: true, name: true, username: true, avatarUrl: true } }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    const total = await prisma.song.count();
    res.json({
      success: true,
      data: tracks,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single track by ID
router.get('/:id', async (req, res) => {
  try {
    const track = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: {
        artist: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST upload track
router.post('/upload', async (req, res) => {
  try {
    res.json({ success: true, message: 'Upload endpoint placeholder' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
