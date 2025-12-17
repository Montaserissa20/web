// src/controllers/auth.controller.js
const AuthService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Register error:', err);
    res
      .status(400)
      .json({ message: err.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ message: err.message || 'Login failed' });
  }
};
exports.changePassword = async (req, res) => {
  try {
    // `auth.middleware` should decode JWT and put user on req.user
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await AuthService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to change password',
    });
  }
};