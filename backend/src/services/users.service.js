// src/services/users.service.js
const UserModel = require('../models/user.model');

exports.getCurrentUser = async (userId) => {
  const user = await UserModel.findByIdPublic(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

exports.getAllUsers = async () => {
  return UserModel.getAllUsersPublic();
};

exports.changeUserRole = async (userId, newRole) => {
  const allowedRoles = ['user', 'moderator', 'admin'];
  if (!allowedRoles.includes(newRole)) {
    throw new Error('Invalid role');
  }

  return UserModel.updateUserRole(userId, newRole);
};

exports.banUser = async (userId) => {
  return UserModel.setUserBanStatus(userId, true);
};

exports.unbanUser = async (userId) => {
  return UserModel.setUserBanStatus(userId, false);
};
exports.updateProfile = async (userId, data) => {
  return UserModel.updateProfile(userId, data);
};
