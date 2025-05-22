const mongoose = require('mongoose');
const Admin = require('./admin/models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  const admin = new Admin({
    username: 'admin',
    password: 'securePassword123' // raw password, let schema hash it
  });

  await admin.save();
  console.log('Admin created successfully');
  process.exit();
}).catch(err => {
  console.error('Error creating admin:', err);
});
