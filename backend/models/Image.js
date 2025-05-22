const mongoose = require('mongoose');


const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  detections: [
    {
      class: Number,
      confidence: Number,
      box: [Number], // [x1, y1, x2, y2]
      category: {
      type: String,
      default: '',
      },
    }
  ],
  
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);

module.exports = Image;