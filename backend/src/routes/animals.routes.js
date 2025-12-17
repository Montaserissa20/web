const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth.middleware');
const AnimalsController = require('../controllers/animals.controller');
const { uploadAnimalImages } = require('../middleware/upload.middleware');

// Public
router.get('/', AnimalsController.getPublicListings);
router.get('/slug/:slug', AnimalsController.getBySlug);

// Record view (public with optional auth to check if owner)
router.post('/:id/view', optionalAuth, AnimalsController.recordView);

// Logged in
router.post('/', auth, AnimalsController.createListing);
router.get('/me', auth, AnimalsController.getMyListings);
router.patch('/:id', auth, AnimalsController.updateListing);
router.delete('/:id', auth, AnimalsController.deleteListing);

// Upload images for listing (owner only)
router.post(
  '/:id/images',
  auth,
  uploadAnimalImages.array('images', 6), // field name: images
  AnimalsController.uploadImages
);

module.exports = router;
