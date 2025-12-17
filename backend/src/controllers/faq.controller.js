// src/controllers/faq.controller.js
const FaqModel = require('../models/faq.model');

// GET /api/faq
exports.getAll = async (req, res) => {
  try {
    const data = await FaqModel.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error('getAll faq error', err);
    res.status(500).json({ success: false, message: 'Failed to load FAQ' });
  }
};

// GET /api/faq/public
exports.getPublic = async (req, res) => {
  try {
    const data = await FaqModel.getPublic();
    res.json({ success: true, data });
  } catch (err) {
    console.error('getPublic faq error', err);
    res.status(500).json({ success: false, message: 'Failed to load FAQ' });
  }
};

// POST /api/faq
exports.create = async (req, res) => {
  try {
    const { question, answer, category, order, isVisible } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }

    const faq = await FaqModel.create({ question, answer, category, order, isVisible });
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    console.error('create faq error', err);
    res.status(500).json({ success: false, message: 'Failed to create FAQ' });
  }
};

// PUT /api/faq/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FaqModel.update(id, req.body);
    res.json({ success: true, data: faq });
  } catch (err) {
    console.error('update faq error', err);
    res.status(500).json({ success: false, message: 'Failed to update FAQ' });
  }
};

// DELETE /api/faq/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await FaqModel.remove(id);
    res.json({ success: true, data: null, message: 'FAQ deleted' });
  } catch (err) {
    console.error('delete faq error', err);
    res.status(500).json({ success: false, message: 'Failed to delete FAQ' });
  }
};
