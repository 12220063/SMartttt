const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, // Example: "PET", "HDPE", "PVC", etc.
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set when document is created
  },
});

// Update statistics after a new prediction is saved
predictionSchema.post('save', async function (doc) {
  try {
    // Fetch updated statistics dynamically
    await updateStatistics();
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
});

// Function to update statistics dynamically
async function updateStatistics() {
  try {
    // Fetch counts for each plastic type using aggregation
    const plasticTypes = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'OTHER'];
    const stats = await mongoose.model('Prediction').aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Process stats and update in-memory data or any cache if required
    const updatedStats = {};
    stats.forEach(item => {
      updatedStats[item._id] = item.count;
    });

    console.log('Updated Statistics:', updatedStats);
    // You can save the updated stats to a separate collection or in memory if needed

  } catch (error) {
    console.error('Error fetching updated statistics:', error);
  }
}

module.exports = mongoose.model('Prediction', predictionSchema);
