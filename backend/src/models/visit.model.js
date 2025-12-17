// src/models/visit.model.js
const prisma = require('../config/prismaClient');

// create a visit record
exports.createVisit = async ({ userId, ipAddress, userAgent }) => {
  return prisma.visits.create({
    data: {
      user_id: userId ?? null,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
    },
  });
};

/**
 * Total visitors = 
 *   - distinct logged-in users (user_id not null)
 *   - plus distinct guest IPs (user_id null)
 */
exports.countTotalVisits = async () => {
  // distinct logged-in users
  const loggedUsers = await prisma.visits.groupBy({
    by: ['user_id'],
    where: {
      user_id: { not: null },
    },
  });

  // distinct guests by IP
  const guestIps = await prisma.visits.groupBy({
    by: ['ip_address'],
    where: {
      user_id: null,
      ip_address: { not: null },
    },
  });

  return loggedUsers.length + guestIps.length;
};

/**
 * Online users = distinct visitors (logged in + guests)
 * with a visit in the last N minutes
 */
exports.countOnlineUsers = async (minutes = 5) => {
  const since = new Date(Date.now() - minutes * 60 * 1000);

  const loggedUsers = await prisma.visits.groupBy({
    by: ['user_id'],
    where: {
      visited_at: { gte: since },
      user_id: { not: null },
    },
  });

  const guestIps = await prisma.visits.groupBy({
    by: ['ip_address'],
    where: {
      visited_at: { gte: since },
      user_id: null,
      ip_address: { not: null },
    },
  });

  return loggedUsers.length + guestIps.length;
};
