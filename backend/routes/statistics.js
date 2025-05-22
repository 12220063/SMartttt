const express = require('express');
const router = express.Router();
const Image = require('../models/Image'); // Import the Image model (make sure the path is correct)

// GET /api/statistics
router.get('/', async (req, res) => {
  try {
    // Fetch all images from database
    const images = await Image.find({});

    // Initialize counters for each plastic type
    const totals = {
      PET: 0,
      HDPE: 0,
      PVC: 0,
      LDPE: 0,
      PP: 0,
      PS: 0,
      OTHER: 0,
    };

    // Loop through images and their detections
    images.forEach((image) => {
      image.detections.forEach((detection) => {
        switch (detection.class) {
          case 0: totals.PET += 1; break;
          case 1: totals.HDPE += 1; break;
          case 2: totals.PVC += 1; break;
          case 3: totals.LDPE += 1; break;
          case 4: totals.PP += 1; break;
          case 5: totals.PS += 1; break;
          case 6: totals.OTHER += 1; break;
          default: break;
        }
      });
    });

    // Calculate total number of detections
    const totalDetections = Object.values(totals).reduce((sum, val) => sum + val, 0);

    // Calculate percentage for each type
    const percentages = {};
    for (const type in totals) {
      percentages[type] = totalDetections > 0 ? ((totals[type] / totalDetections) * 100).toFixed(1) : 0;
    }

    // Dummy weekly data (you can replace this with actual data if you have it)
    const weeklyData = [
      { name: 'Week 1', ...totals },
      { name: 'Week 2', ...totals },
      { name: 'Week 3', ...totals },
      { name: 'Week 4', ...totals },
    ];

    res.json({
      totals,
      percentages,
      weeklyData,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
