// src/controllers/users.controller.js
const UsersService = require('../services/users.service');
const RatingModel = require('../models/rating.model');
const UserModel = require('../models/user.model');
const prisma = require('../config/prismaClient');

// Get public profile for any user
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    // Get user basic info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get rating stats
    const ratingStats = await RatingModel.getAverageRating(userId);

    // Get user's approved listings count
    const listingsCount = await prisma.animals.count({
      where: { user_id: userId, status: 'approved' },
    });

    // Get recent ratings/reviews
    const ratings = await prisma.ratings.findMany({
      where: { rated_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    // Get rater names for ratings
    const raterIds = ratings.map(r => r.rater_id);
    const raters = await prisma.users.findMany({
      where: { id: { in: raterIds } },
      select: { id: true, name: true, avatar_url: true },
    });
    const raterMap = Object.fromEntries(raters.map(r => [r.id, r]));

    const ratingsWithRater = ratings.map(r => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      createdAt: r.created_at,
      rater: {
        id: String(r.rater_id),
        name: raterMap[r.rater_id]?.name || 'Unknown',
        avatar: raterMap[r.rater_id]?.avatar_url || null,
      },
    }));

    res.json({
      success: true,
      data: {
        id: String(user.id),
        displayName: user.name,
        country: user.country || '',
        city: user.city || '',
        avatar: user.avatar_url,
        createdAt: user.created_at,
        rating: ratingStats.average,
        ratingCount: ratingStats.count,
        listingsCount,
        ratings: ratingsWithRater,
      },
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

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

// Rate a user
exports.rateUser = async (req, res) => {
  try {
    const { id } = req.params; // user being rated
    const raterId = req.user.id; // current user (rater)
    const { rating, review } = req.body;

    // Cannot rate yourself
    if (Number(id) === Number(raterId)) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if user exists
    const userExists = await prisma.users.findUnique({ where: { id: Number(id) } });
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await RatingModel.upsertRating({
      raterId,
      ratedId: id,
      rating,
      review,
    });

    res.json({
      success: true,
      data: {
        rating: result.rating,
        review: result.review,
      },
      message: 'Rating submitted successfully',
    });
  } catch (err) {
    console.error('rateUser error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
};

// Get current user's rating for another user
exports.getMyRating = async (req, res) => {
  try {
    const { id } = req.params; // user being rated
    const raterId = req.user.id; // current user

    const rating = await RatingModel.getRating(raterId, id);

    res.json({
      success: true,
      data: rating ? { rating: rating.rating, review: rating.review } : null,
    });
  } catch (err) {
    console.error('getMyRating error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rating' });
  }
};

// Delete my rating for a user
exports.deleteMyRating = async (req, res) => {
  try {
    const { id } = req.params;
    const raterId = req.user.id;

    await RatingModel.deleteRating(raterId, id);

    res.json({ success: true, message: 'Rating deleted' });
  } catch (err) {
    console.error('deleteMyRating error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete rating' });
  }
};