const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Save image + detections
router.post('/save', async (req, res) => {
  try {
    const { image, detections } = req.body;

    const buffer = Buffer.from(image, 'base64');
    const filename = `${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    const newImage = new Image({
      filename,
      path: filepath,
      detections
    });

    await newImage.save();
    res.status(200).json({ message: 'Saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save.' });
  }
});

module.exports = router;
