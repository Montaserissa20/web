// src/models/rating.model.js
const prisma = require('../config/prismaClient');

// Create or update a rating
exports.upsertRating = async ({ raterId, ratedId, rating, review }) => {
  return prisma.ratings.upsert({
    where: {
      rater_id_rated_id: {
        rater_id: Number(raterId),
        rated_id: Number(ratedId),
      },
    },
    update: {
      rating: Number(rating),
      review: review || null,
      updated_at: new Date(),
    },
    create: {
      rater_id: Number(raterId),
      rated_id: Number(ratedId),
      rating: Number(rating),
      review: review || null,
    },
  });
};

// Get a specific rating by rater and rated user
exports.getRating = async (raterId, ratedId) => {
  return prisma.ratings.findUnique({
    where: {
      rater_id_rated_id: {
        rater_id: Number(raterId),
        rated_id: Number(ratedId),
      },
    },
  });
};

// Get all ratings for a user (as the rated person)
exports.getRatingsForUser = async (userId) => {
  return prisma.ratings.findMany({
    where: { rated_id: Number(userId) },
    orderBy: { created_at: 'desc' },
  });
};

// Get average rating for a user
exports.getAverageRating = async (userId) => {
  const result = await prisma.ratings.aggregate({
    where: { rated_id: Number(userId) },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating || 0,
    count: result._count.rating || 0,
  };
};

// Delete a rating
exports.deleteRating = async (raterId, ratedId) => {
  return prisma.ratings.delete({
    where: {
      rater_id_rated_id: {
        rater_id: Number(raterId),
        rated_id: Number(ratedId),
      },
    },
  });
};

