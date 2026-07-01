const prisma = require('../utils/prisma');

// POST /api/tracks/upload - Flutter compatibility endpoint
// Expects multipart/form-data with:
// - audioFile (required)
// - title (required)
// - duration (optional; defaults to 0)
//
// Creates a Song record.
exports.uploadTrack = async (req, res) => {
  try {
    const artistId = req.user?.id;
    if (!artistId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // In this codebase, uploads for artists are handled via artistController + express-validator style checks.
    // For this compatibility route, we expect multer middleware to provide req.file.
    const { title, duration } = req.body || {};
    if (!title || !req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'title and audioFile are required' });
    }

    const durationInt = duration ? parseInt(duration, 10) : 0;

    const song = await prisma.song.create({
      data: {
        title,
        artistId,
        fileUrl: `/uploads/music/${req.file.filename}`,
        duration: Number.isFinite(durationInt) ? durationInt : 0,
        playCount: 0,
      },
    });

    res.json({
      success: true,
      data: {
        id: song.id,
        title: song.title,
        fileUrl: song.fileUrl,
        duration: song.duration,
      },
    });
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({ success: false, message: 'Failed to upload track', error: error.message });
  }
};

