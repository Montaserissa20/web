// src/services/stats.service.js
const VisitModel = require('../models/visit.model');

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
