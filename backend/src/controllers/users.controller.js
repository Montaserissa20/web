// src/controllers/users.controller.js
const UsersService = require('../services/users.service');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UsersService.getCurrentUser(Number(userId));
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(404).json({ message: err.message || 'User not found' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UsersService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await UsersService.changeUserRole(Number(id), role);
    res.json(updated);
  } catch (err) {
    console.error('changeRole error:', err);
    res.status(400).json({ message: err.message || 'Failed to change role' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await UsersService.banUser(Number(id));
    res.json(updated);
  } catch (err) {
    console.error('banUser error:', err);
    res.status(400).json({ message: err.message || 'Failed to ban user' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await UsersService.unbanUser(Number(id));
    res.json(updated);
  } catch (err) {
    console.error('unbanUser error:', err);
    res.status(400).json({ message: err.message || 'Failed to unban user' });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id; // set by auth.middleware

    // Only allow user to edit their own profile
    if (!currentUserId || Number(id) !== Number(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this profile',
      });
    }

    const { displayName, country, city } = req.body;

    const updated = await UsersService.updateProfile(id, {
      name: displayName, // map displayName -> name
      country,
      city,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Profile updated',
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update profile',
    });
  }
};