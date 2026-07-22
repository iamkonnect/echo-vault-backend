const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect, authorize } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer for gift icons
const giftIconDir = path.join(__dirname, '../../public/gift-icons');
if (!fs.existsSync(giftIconDir)) {
  fs.mkdirSync(giftIconDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, giftIconDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gift-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/gif', 'image/jpeg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, GIF, JPEG, and WebP images are allowed'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// ============ GIFT CRUD OPERATIONS ============

// GET all gifts (admin)
router.get('/gifts/api', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const gifts = await prisma.giftTemplate.findMany({
      orderBy: { actualAmount: 'asc' },
      select: {
        id: true,
        name: true,
        actualAmount: true,
        price: true,
        icon: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: gifts,
      count: gifts.length
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gifts',
      error: error.message
    });
  }
});

// GET single gift
router.get('/gifts/:id', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const gift = await prisma.giftTemplate.findUnique({
      where: { id: req.params.id }
    });

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: 'Gift not found'
      });
    }

    res.json({
      success: true,
      data: gift
    });
  } catch (error) {
    console.error('Error fetching gift:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gift',
      error: error.message
    });
  }
});

// CREATE gift
router.post('/gifts/create', upload.single('icon'), protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, price, actualAmount } = req.body;

    // Validate
    if (!name || !price || !actualAmount) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Name, price, and actual amount are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Icon file is required'
      });
    }

    const iconPath = `/gift-icons/${req.file.filename}`;

    const gift = await prisma.giftTemplate.create({
      data: {
        name: String(name).trim(),
        actualAmount: parseFloat(actualAmount),
        price: parseFloat(price),
        icon: iconPath,
        isActive: true
      }
    });

    console.log(`✅ Gift created: ${gift.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Gift created successfully',
      data: gift
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error creating gift:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gift',
      error: error.message
    });
  }
});

// UPDATE gift
router.put('/gifts/:id', upload.single('icon'), protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, price, actualAmount, isActive } = req.body;
    const giftId = req.params.id;

    // Check if gift exists
    const existingGift = await prisma.giftTemplate.findUnique({
      where: { id: giftId }
    });

    if (!existingGift) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Gift not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = String(name).trim();
    if (price) updateData.price = parseFloat(price);
    if (actualAmount) updateData.actualAmount = parseFloat(actualAmount);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    // Handle icon update
    if (req.file) {
      // Delete old icon if exists
      if (existingGift.icon) {
        const oldIconPath = path.join(__dirname, '../../public', existingGift.icon);
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
      updateData.icon = `/gift-icons/${req.file.filename}`;
    }

    const updatedGift = await prisma.giftTemplate.update({
      where: { id: giftId },
      data: updateData
    });

    console.log(`✅ Gift updated: ${updatedGift.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Gift updated successfully',
      data: updatedGift
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error updating gift:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gift',
      error: error.message
    });
  }
});

// DELETE gift
router.delete('/gifts/:id', protect, authorize(['ADMIN']), async (req, res) => {
  try {
    const giftId = req.params.id;

    const gift = await prisma.giftTemplate.findUnique({
      where: { id: giftId }
    });

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: 'Gift not found'
      });
    }

    // Delete icon file
    if (gift.icon) {
      const iconPath = path.join(__dirname, '../../public', gift.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    // Delete from database
    await prisma.giftTemplate.delete({
      where: { id: giftId }
    });

    console.log(`✅ Gift deleted: ${gift.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Gift deleted successfully',
      data: gift
    });
  } catch (error) {
    console.error('Error deleting gift:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gift',
      error: error.message
    });
  }
});

module.exports = router;
