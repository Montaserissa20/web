// src/routes/announcement.routes.js
const express = require('express');
const controller = require('../controllers/announcement.controller');
// const { requireAuth, requireAdmin } = require('../middleware/auth'); // optional

const router = express.Router();

// Public
router.get('/public', controller.getPublic);

// Admin (you can protect later with middleware)
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
