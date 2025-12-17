// src/models/user.model.js
const prisma = require('../config/prismaClient');

// Helper: map Prisma User → frontend User shape
function toFrontendUser(user, extras = {}) {
  if (!user) return null;

  const createdAtValue = user.createdAt || user.created_at || null;

  return {
    id: String(user.id),
    email: user.email,
    displayName: user.name,
    role: user.role,
    country: user.country || '',
    city: user.city || '',
    avatar: user.avatarUrl || null,          // adjust field if you don't have avatarUrl
    rating: extras.rating ?? 0,
    totalListings: extras.totalListings ?? 0,
    createdAt: createdAtValue
      ? new Date(createdAtValue).toISOString()
      : '',
    isBanned: user.isBanned ?? false,        // if you don't have it yet, will be false
  };
}

// Create a new user
exports.createUser = async ({ name, email, password, country, city }) => {
  // Generate a default avatar URL based on the user's name
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;

  const user = await prisma.users.create({
    data: {
      name,
      email,
      password,       // <-- already hashed
      country,
      city,
      role: 'user',
      avatar_url: defaultAvatar,
    },
  });

  return toFrontendUser(user);
};

// Find user by email (raw, used for login)
exports.findByEmailRaw = async (email) => {
  const user = await prisma.users.findUnique({
    where: { email },
  });
  return user;
};

// Find user by id (public format for API)
exports.findByIdPublic = async (id) => {
  const user = await prisma.users.findUnique({
    where: { id },
  });
  return toFrontendUser(user);
};

// List all users (for admin)
exports.getAllUsers = async () => {
  return prisma.users.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_banned: true,      // or isBanned
      created_at: true,
    },
  });
};

// Change user role
exports.updateUserRole = async (userId, role) => {
  return prisma.users.update({
    where: { id: Number(userId) },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_banned: true,
      created_at: true,
    },
  });
};

// Ban / unban user
exports.setUserBanStatus = async (userId, isBanned) => {
  return prisma.users.update({
    where: { id: Number(userId) },
    data: { is_banned: !!isBanned }, // or isBanned
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_banned: true,
      created_at: true,
    },
  });
};
exports.updateProfile = async (userId, { name, country, city }) => {
  const user = await prisma.users.update({
    where: { id: Number(userId) },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(city !== undefined ? { city } : {}),
    },
  });

  return toFrontendUser(user);
};

// Find user by id (raw, for password change)
exports.findByIdRaw = async (id) => {
  return prisma.users.findUnique({
    where: { id: Number(id) },
  });
};

// Update password (hashed) for a user
exports.updatePassword = async (userId, passwordHash) => {
  return prisma.users.update({
    where: { id: Number(userId) },
    data: { password: passwordHash },
    select: {
      id: true,
    },
  });
};

