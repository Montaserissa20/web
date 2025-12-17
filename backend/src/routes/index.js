const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const announcementRoutes = require('./announcement.routes');
const faqRoutes = require('./faq.routes');
const statsRoutes = require('./stats.routes');
const adminUsersRoutes = require('./adminUsers.routes');
const animalsRoutes = require('./animals.routes');
const adminAnimalsRoutes = require('./adminAnimals.routes');
const reportRoutes = require('./report.routes');
const messageRoutes = require('./message.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/announcements', announcementRoutes);
router.use('/faq', faqRoutes);
router.use('/stats', statsRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/animals', animalsRoutes);
router.use('/admin/animals', adminAnimalsRoutes);
router.use('/reports', reportRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
