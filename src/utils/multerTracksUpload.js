const multer = require('multer');
const path = require('path');

// Shared multer config for track uploads.
// Stores uploaded files into public-facing uploads/music.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'public', 'uploads', 'music'));
  },
  filename: (req, file, cb) => {
    const safeName = (file.originalname || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const uploadTrack = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { uploadTrack };

