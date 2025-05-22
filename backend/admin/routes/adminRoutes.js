const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');

router.post('/login', loginAdmin);

const Image = require('../../models/Image');
 // Adjust path if needed

// GET /api/images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
