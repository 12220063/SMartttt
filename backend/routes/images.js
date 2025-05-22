const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// New route to get waste stats
router.get('/stats', async (req, res) => {
  try {
    const allImages = await Image.find({});
    
    const recyclingCounts = {
      "1-PET": 0,
      "2-HDPE": 0,
      "3-PVC": 0,
      "4-LDPE": 0,
      "5-PP": 0,
      "6-PS": 0,
      "7-O": 0,
      "Non-Waste": 0,
    };

    allImages.forEach(img => {
      const code = img.detections?.[0]?.category || "Unknown";
      if (recyclingCounts[code] !== undefined) {
        recyclingCounts[code]++;
      }
    });

    const total = allImages.length;

    res.json({ total, categories: recyclingCounts });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
