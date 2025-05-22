const express = require('express');
const app = express();
const userRoutes = require('./user/routes/userRoutes');
const adminRoutes = require('./admin/routes/adminRoutes');

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
