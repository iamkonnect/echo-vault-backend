const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const audioUploadDir = path.join(__dirname, 'public', 'uploads', 'audio');
const videoUploadDir = path.join(__dirname, 'public', 'uploads', 'video');
const imageUploadDir = path.join(__dirname, 'public', 'uploads', 'images');

ensureDirectoryExistence(audioUploadDir);
ensureDirectoryExistence(videoUploadDir);
ensureDirectoryExistence(imageUploadDir);

// Storage configuration for audio files
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Storage configuration for video files (for both music videos and shorts)
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, videoUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Storage configuration for image files (for cover art and thumbnails)
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter for audio
const audioFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

// File filter for video
const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

// File filter for images - allows all image types for general use
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// File filter for gift icons - strictly PNG and GIF only
const giftIconFilter = (req, file, cb) => {
    const allowedMimes = ['image/gif', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only GIF and PNG files are allowed for gift icons!'), false);
    }
};

exports.uploadAudio = multer({ storage: audioStorage, fileFilter: audioFilter });
exports.uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter });
exports.uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });
exports.uploadGiftIcon = multer({ 
    storage: imageStorage, 
    fileFilter: giftIconFilter, 
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max for icons
});
