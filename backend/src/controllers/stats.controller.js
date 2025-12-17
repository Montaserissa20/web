// src/controllers/stats.controller.js
const StatsService = require('../services/stats.service');
const jwt = require('jsonwebtoken');

exports.trackVisit = async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  try {
    // 1) Try to get user id from JWT if present
    let userId = null;

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        userId = payload.id;          // <— this is the id we put into the token
      } catch (err) {
        // invalid/expired token → treat as guest
        userId = null;
      }
    }

    // 2) IP & user agent
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;

    const userAgent = req.headers['user-agent'] || null;

    // 3) Save visit
    await StatsService.trackVisit({ userId, ipAddress, userAgent });

    res.status(201).json({ success: true, message: 'Visit tracked' });
  } catch (err) {
    console.error('trackVisit error:', err);
    res.status(500).json({ success: false, message: 'Failed to track visit' });
  }
};

exports.getSiteTraffic = async (req, res) => {
  try {
    const stats = await StatsService.getSiteTrafficStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('getSiteTraffic error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch site traffic' });
  }
};
