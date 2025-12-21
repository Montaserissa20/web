const FavoriteService = require('../services/favorite.service');

// GET /api/favorites - Get user's favorites
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await FavoriteService.getUserFavorites(userId);
    res.json({ success: true, data: favorites });
  } catch (err) {
    console.error('getUserFavorites error:', err);
    res.status(500).json({ success: false, message: 'Failed to get favorites' });
  }
};

// GET /api/favorites/ids - Get favorite IDs for quick lookup
exports.getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const ids = await FavoriteService.getFavoriteIds(userId);
    res.json({ success: true, data: ids });
  } catch (err) {
    console.error('getFavoriteIds error:', err);
    res.status(500).json({ success: false, message: 'Failed to get favorite IDs' });
  }
};

// POST /api/favorites/:animalId - Add to favorites
exports.add = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animalId } = req.params;
    
    const result = await FavoriteService.add(userId, animalId);
    
    if (result.alreadyFavorited) {
      return res.json({ success: true, message: 'Already in favorites', data: { favorited: true } });
    }
    
    res.status(201).json({ success: true, message: 'Added to favorites', data: { favorited: true } });
  } catch (err) {
    console.error('add favorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to add favorite' });
  }
};

// DELETE /api/favorites/:animalId - Remove from favorites
exports.remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animalId } = req.params;
    
    await FavoriteService.remove(userId, animalId);
    res.json({ success: true, message: 'Removed from favorites', data: { favorited: false } });
  } catch (err) {
    console.error('remove favorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove favorite' });
  }
};

// POST /api/favorites/:animalId/toggle - Toggle favorite status
exports.toggle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animalId } = req.params;
    
    const result = await FavoriteService.toggle(userId, animalId);
    
    const message = result.favorited ? 'Added to favorites' : 'Removed from favorites';
    res.json({ success: true, message, data: result });
  } catch (err) {
    console.error('toggle favorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

// GET /api/favorites/check/:animalId - Check if animal is favorited
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animalId } = req.params;
    
    const isFavorited = await FavoriteService.isFavorited(userId, animalId);
    res.json({ success: true, data: { favorited: isFavorited } });
  } catch (err) {
    console.error('checkFavorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to check favorite status' });
  }
};

