// src/services/stats.service.js
const VisitModel = require('../models/visit.model');
const prisma = require('../config/prismaClient');
const FavoriteModel = require('../models/favorite.model');

// Online user timeout in minutes (default: 5 minutes)
const ONLINE_USER_TIMEOUT_MINUTES = parseInt(process.env.ONLINE_USER_TIMEOUT_MINUTES || '5', 10);

exports.trackVisit = async ({ userId, ipAddress, userAgent }) => {
  await VisitModel.createVisit({ userId, ipAddress, userAgent });
};

exports.getSiteTrafficStats = async () => {
  const [totalVisitors, onlineUsers] = await Promise.all([
    VisitModel.countTotalVisits(),
    VisitModel.countOnlineUsers(ONLINE_USER_TIMEOUT_MINUTES),
  ]);

  return {
    totalVisitors,
    onlineUsers,
  };
};

// Get dashboard stats for a specific user
exports.getUserDashboardStats = async (userId) => {
  const userIdNum = Number(userId);

  // Get all user's listings
  const listings = await prisma.animals.findMany({
    where: { user_id: userIdNum },
    select: { id: true, status: true, views: true },
  });

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'approved').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

  // Get total favorites on user's listings
  const totalFavorites = await FavoriteModel.countForUserListings(userIdNum);

  return {
    totalListings,
    activeListings,
    totalViews,
    totalFavorites,
  };
};

// Get admin stats
exports.getAdminStats = async () => {
  const [totalUsers, totalListings, pendingListings, countriesResult] = await Promise.all([
    prisma.users.count(),
    prisma.animals.count(),
    prisma.animals.count({ where: { status: 'pending' } }),
    prisma.animals.groupBy({
      by: ['country'],
      where: { country: { not: null } },
    }),
  ]);

  // Get new users and listings this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [newUsersThisMonth, newListingsThisMonth] = await Promise.all([
    prisma.users.count({ where: { created_at: { gte: startOfMonth } } }),
    prisma.animals.count({ where: { created_at: { gte: startOfMonth } } }),
  ]);

  return {
    totalUsers,
    totalListings,
    pendingListings,
    totalCountries: countriesResult.length,
    totalCities: 0, // Can be implemented if needed
    newUsersThisMonth,
    newListingsThisMonth,
  };
};
exports.getHomeStats = async () => {
  // ✅ ONLY approved listings
  const totalListings = await prisma.animals.count({
    where: { status: 'approved' },
  });

  const totalUsers = await prisma.users.count();

  // ✅ ONLY approved listings grouped by species
  const grouped = await prisma.animals.groupBy({
    by: ['species'],
    where: { status: 'approved' },
    _count: { _all: true },
  });

  const categoryCounts = grouped.reduce((acc, row) => {
    acc[row.species] = row._count._all;
    return acc;
  }, {});

  return { totalListings, totalUsers, categoryCounts };
};
