const express = require('express');
const router = express.Router();
const Admin = require('../admin/models/Admin');


// GET admin profile image
router.get('/admin/profile-image', async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: 'admin' });
    res.json({ image: admin?.image || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST to update admin profile image
router.post('/update-image', async (req, res) => {
  const { image } = req.body;
  console.log("Received image:", image);  // Ensure you're receiving the image correctly

  const admin = await Admin.findOne({ username: 'admin' });
  if (admin) {
    admin.image = image;
    await admin.save();
    console.log("Saved image:", admin.image);  // Confirm the image is saved in the database
    return res.json({ message: 'Profile image updated', image: admin.image });
  }
  res.status(404).json({ message: 'Admin not found' });
});




module.exports = router;
