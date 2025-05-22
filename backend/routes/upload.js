const express = require('express');
const router = express.Router();
const multer = require('multer');
const Image = require('../models/Image'); // correct path
const Prediction = require('../models/Predictions'); // correct path

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // your folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Helper to map class number to plastic type
function getPlasticTypeFromClass(classNum) {
  const classMap = {
    0: 'PET',
    1: 'HDPE',
    2: 'PVC',
    3: 'LDPE',
    4: 'PP',
    5: 'PS',
    6: 'OTHER'
  };
  return classMap[classNum] || 'OTHER';
}

// Fetch all uploaded images
router.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ _id: -1 }); // latest first
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images' });
  }
});


// Route to upload image and save detections + predictions
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { detections } = req.body;

    const parsedDetections = JSON.parse(detections);

    const newImage = new Image({
      filename: req.file.filename,
      path: req.file.path,
      detections: parsedDetections,
    });

    await newImage.save();

    // Save predictions for each detection
    for (const detection of parsedDetections) {
      const prediction = new Prediction({
        type: getPlasticTypeFromClass(detection.class),
      });
      await prediction.save();
    }

    res.status(201).json({ message: 'Image and predictions saved successfully.' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload.' });
  }
});

module.exports = router;
