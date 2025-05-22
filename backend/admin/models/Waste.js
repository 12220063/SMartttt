const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "1-PET",
      "2-HDPE",
      "3-PVC",
      "4-LDPE",
      "5-PP",
      "6-PS",
      "7-O",
      "Non-Waste"
    ],
  },
  confidence: {
    type: Number,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Waste', wasteSchema);