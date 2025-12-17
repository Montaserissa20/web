// src/services/adminUser.service.js
const UserModel = require('../models/user.model');

const VALID_ROLES = ['user', 'moderator', 'admin'];

/**
 * Map a row from Prisma (users table) to the frontend User interface
 */
function mapAdminUser(row) {
  if (!row) return null;

  // In getAllUsers / updateUserRole / setUserBanStatus you select:
  // id, name, email, role, is_banned, created_at
  const createdAt = row.created_at || row.createdAt || null;

  return {
    id: String(row.id),
    email: row.email,
    displayName: row.name,                          // 👈 used by AdminUsers page
    role: row.role,
    isBanned: !!(row.is_banned ?? row.isBanned),    // handle both styles
    country: row.country || '',                     // optional, in case you add it later
    city: row.city || '',
    avatar: row.avatar_url || row.avatarUrl || null,
    rating: 0,
    totalListings: 0,
    createdAt: createdAt ? new Date(createdAt).toISOString() : '',
  };
}

/**
 * List all users for admin
 */
exports.getAllUsers = async () => {
  const rows = await UserModel.getAllUsers();
  return rows.map(mapAdminUser);
};

/**
 * Change user role
 */
exports.changeRole = async (userId, role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error('Invalid role');
  }

  const row = await UserModel.updateUserRole(userId, role);
  return mapAdminUser(row);
};

/**
 * Set ban / unban status
 */
exports.setBanStatus = async (userId, isBanned) => {
  const row = await UserModel.setUserBanStatus(userId, isBanned);
  return mapAdminUser(row);
};
