const express = require('express');
const router = express.Router();
const Waste = require('../../models/Waste');

// Update class by ID
router.put('/:id', async (req, res) => {
  try {
    const { class: newClass } = req.body;

    if (!newClass) {
      return res.status(400).json({ message: 'Class is required.' });
    }

    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      { class: newClass },
      { new: true }
    );

    if (!updatedWaste) {
      return res.status(404).json({ message: 'Waste item not found.' });
    }

    res.json(updatedWaste);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;