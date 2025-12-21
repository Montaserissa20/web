const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favorite.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get user's favorites
router.get('/', FavoriteController.getUserFavorites);

// Get favorite IDs for quick lookup
router.get('/ids', FavoriteController.getFavoriteIds);

// Check if specific animal is favorited
router.get('/check/:animalId', FavoriteController.checkFavorite);

// Add to favorites
router.post('/:animalId', FavoriteController.add);

// Toggle favorite status
router.post('/:animalId/toggle', FavoriteController.toggle);

// Remove from favorites
router.delete('/:animalId', FavoriteController.remove);

module.exports = router;

