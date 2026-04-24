const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/tracks/trending - Trending videos/shorts for home feed
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Fetch trending videos and shorts combined, sorted by play count
    const [videos, shorts] = await Promise.all([
      prisma.video.findMany({
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { playCount: 'desc' },
        include: {
          artist: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.short.findMany({
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { playCount: 'desc' },
        include: {
          artist: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      }),
    ]);

    // Format response to match Flutter UI expectations
    const trendingTracks = [
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        type: 'video',
        cover: v.thumbnailUrl || 'assets/default-thumbnail.jpeg',
        artist: v.artist.name || v.artist.username,
        artistId: v.artist.id,
        playCount: v.playCount,
        duration: v.duration,
        fileUrl: v.fileUrl,
        createdAt: v.createdAt,
      })),
      ...shorts.map((s) => ({
        id: s.id,
        title: s.title,
        type: 'short',
        cover: s.thumbnailUrl || 'assets/default-thumbnail.jpeg',
        artist: s.artist.name || s.artist.username,
        artistId: s.artist.id,
        playCount: s.playCount,
        giftCount: s.giftCount,
        duration: s.duration,
        videoUrl: s.videoUrl,
        createdAt: s.createdAt,
      })),
    ];

    res.json({
      success: true,
      data: trendingTracks,
      count: trendingTracks.length,
    });
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending tracks',
      error: error.message,
    });
  }
});

// GET /api/tracks/featured - Featured tracks for dashboard carousel
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Fetch top videos and shorts
    const [videos, shorts] = await Promise.all([
      prisma.video.findMany({
        take: Math.ceil(parseInt(limit) / 2),
        orderBy: { playCount: 'desc' },
        include: {
          artist: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      }),
      prisma.short.findMany({
        take: Math.floor(parseInt(limit) / 2),
        orderBy: { playCount: 'desc' },
        include: {
          artist: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      }),
    ]);

    const featuredTracks = [
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        cover: v.thumbnailUrl || 'assets/default-thumbnail.jpeg',
        artist: v.artist.name || v.artist.username,
      })),
      ...shorts.map((s) => ({
        id: s.id,
        title: s.title,
        cover: s.thumbnailUrl || 'assets/default-thumbnail.jpeg',
        artist: s.artist.name || s.artist.username,
      })),
    ];

    res.json({
      success: true,
      data: featuredTracks,
    });
  } catch (error) {
    console.error('Error fetching featured tracks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured tracks',
      error: error.message,
    });
  }
});

module.exports = router;
