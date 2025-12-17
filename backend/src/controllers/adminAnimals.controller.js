// src/controllers/adminAnimals.controller.js
const AnimalService = require('../services/animal.service');

exports.listAll = async (req, res) => {
  try {
    const listings = await AnimalService.getAllListingsAdmin();
    res.json({ success: true, data: listings });
  } catch (err) {
    console.error('admin listAll error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
    });
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AnimalService.updateStatusAdmin(id, 'approved');
    res.json({
      success: true,
      data: updated,
      message: 'Listing approved',
    });
  } catch (err) {
    console.error('admin approve error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to approve listing',
    });
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await AnimalService.updateStatusAdmin(id, 'rejected', reason || 'No reason provided');
    res.json({
      success: true,
      data: updated,
      message: 'Listing rejected',
    });
  } catch (err) {
    console.error('admin reject error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to reject listing',
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await AnimalService.deleteListing(id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    console.error('admin remove error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to delete listing',
    });
  }
};
