// src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return { secret, expiresIn };
}

function createToken(user) {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      isBanned: user.is_banned ?? user.isBanned ?? false,
    },
    secret,
    { expiresIn }
  );
}

exports.register = async (payload) => {
  const { email, password, displayName, country, city } = payload;

  if (!email || !password || !displayName) {
    throw new Error('Email, password and display name are required');
  }

  const existingRaw = await UserModel.findByEmailRaw(email);
  if (existingRaw) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.createUser({
    name: displayName,
    email,
    password: passwordHash, // <-- matches createUser now
    country,
    city,
  });

  const token = createToken(user);
  return { user, token };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const userRaw = await UserModel.findByEmailRaw(email);
  if (!userRaw) {
    throw new Error('Invalid email or password');
  }

  // Check banned status if you have isBanned
  if (userRaw.is_banned) {
    throw new Error('Your account has been banned');
  }

  const passwordMatch = await bcrypt.compare(password, userRaw.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const user = await UserModel.findByIdPublic(userRaw.id);

  const token = createToken(user);

  return { user, token };
};
exports.changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Current and new password are required');
  }

  // 1) Load user with current hashed password
  const user = await UserModel.findByIdRaw(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 2) Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // 3) Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // 4) Update in DB
  await UserModel.updatePassword(userId, passwordHash);

  // nothing special to return, controller will just send a success message
  return true;
};
