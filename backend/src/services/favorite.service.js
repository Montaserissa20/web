const FavoriteModel = require('../models/favorite.model');
const AnimalModel = require('../models/animal.model');

// Toggle favorite - add if not exists, remove if exists
exports.toggle = async (userId, animalId) => {
  const isFavorited = await FavoriteModel.isFavorited(userId, animalId);
  
  if (isFavorited) {
    await FavoriteModel.remove(userId, animalId);
    return { favorited: false };
  } else {
    await FavoriteModel.add(userId, animalId);
    return { favorited: true };
  }
};

// Add to favorites
exports.add = async (userId, animalId) => {
  const exists = await FavoriteModel.isFavorited(userId, animalId);
  if (exists) {
    return { alreadyFavorited: true };
  }
  await FavoriteModel.add(userId, animalId);
  return { favorited: true };
};

// Remove from favorites
exports.remove = async (userId, animalId) => {
  const removed = await FavoriteModel.remove(userId, animalId);
  return { removed };
};

// Get user's favorited listings
exports.getUserFavorites = async (userId) => {
  const animals = await FavoriteModel.getByUserId(userId);
  return animals.map(animal => AnimalModel.toListingWithImages(animal));
};

// Check if user has favorited an animal
exports.isFavorited = async (userId, animalId) => {
  return FavoriteModel.isFavorited(userId, animalId);
};

// Get all favorite IDs for a user
exports.getFavoriteIds = async (userId) => {
  return FavoriteModel.getFavoriteIds(userId);
};

// Count favorites for user's listings (for dashboard stats)
exports.countForUserListings = async (userId) => {
  return FavoriteModel.countForUserListings(userId);
};

