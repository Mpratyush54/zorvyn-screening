const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const recordRoutes = require('./record.routes');
const dashboardRoutes = require('./dashboard.routes');

const { authLimiter } = require('../middleware/rate_limit.middleware');

router.use('/auth', authLimiter, authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
