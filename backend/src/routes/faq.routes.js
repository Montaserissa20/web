// src/routes/faq.routes.js
const express = require('express');
const controller = require('../controllers/faq.controller');

const router = express.Router();

router.get('/public', controller.getPublic);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
