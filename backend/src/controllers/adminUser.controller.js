// src/controllers/adminUser.controller.js
const AdminUserService = require('../services/adminUser.service');

exports.listUsers = async (req, res) => {
  try {
    const users = await AdminUserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await AdminUserService.changeRole(id, role);
    res.json({ success: true, data: updated, message: 'Role updated' });
  } catch (err) {
    console.error('updateRole error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update role' });
  }
};

exports.setBanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { isBanned } = req.body;

    // Accept boolean OR "true"/"false" strings (just in case)
    if (typeof isBanned !== 'boolean') {
      if (isBanned === 'true') isBanned = true;
      else if (isBanned === 'false') isBanned = false;
    }

    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: '`isBanned` must be a boolean',
      });
    }

    const updated = await AdminUserService.setBanStatus(id, isBanned);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: updated,
      message: isBanned ? 'User banned' : 'User unbanned',
    });
  } catch (err) {
    console.error('setBanStatus error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update status',
    });
  }
};