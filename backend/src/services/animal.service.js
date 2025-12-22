const AnimalModel = require('../models/animal.model');

exports.createListing = async (userId, data) => {
  if (!data.title || !data.slug || !data.species) {
    throw new Error('Missing required fields: title, slug, species');
  }
  return AnimalModel.createListing(userId, data);
};

exports.updateListing = async (userId, animalId, data) => {
  const animal = await AnimalModel.getById(animalId);
  if (!animal) throw new Error('Listing not found');

  // getById returns a DTO with sellerId (string), not user_id
  if (Number(animal.sellerId) !== Number(userId)) {
    throw new Error('Not allowed to update this listing');
  }

  if (!data.title || !data.slug || !data.species) {
    throw new Error('Missing required fields: title, slug, species');
  }

  return AnimalModel.updateListing(animalId, data);
};

exports.getPublicListings = () => AnimalModel.getPublicListings();

exports.getUserListings = (userId) => AnimalModel.getListingsByUser(userId);

exports.getListingBySlug = (slug) => AnimalModel.getListingBySlug(slug);

exports.uploadListingImages = async (userId, animalId, imageUrls) => {
  const animal = await AnimalModel.getById(animalId);
  if (!animal) throw new Error('Listing not found');

  // getById returns a DTO with sellerId (string), not user_id
  if (Number(animal.sellerId) !== Number(userId)) {
    throw new Error('Not allowed to upload images for this listing');
  }

  return AnimalModel.addImages(animalId, imageUrls);
};

exports.deleteListingOwner = async (userId, animalId) => {
  const animal = await AnimalModel.getById(animalId);
  if (!animal) throw new Error('Listing not found');

  // getById returns a DTO with sellerId (string), not user_id
  if (Number(animal.sellerId) !== Number(userId)) {
    throw new Error('Not allowed to delete this listing');
  }

  await AnimalModel.deleteListing(animalId);
};

exports.getAllListingsAdmin = () => AnimalModel.getAllListings();

exports.updateStatusAdmin = async (animalId, status, rejectionReason = null) => {
  const allowedStatuses = ['pending', 'approved', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }
  return AnimalModel.updateStatus(animalId, status, rejectionReason);
};

exports.deleteListing = (animalId) => AnimalModel.deleteListing(animalId);

// Increment view count if viewer is not the owner
exports.incrementViews = async (animalId, viewerId = null) => {
  const ownerId = await AnimalModel.getOwnerId(animalId);

  // Don't increment if the viewer is the owner
  if (viewerId && ownerId && Number(viewerId) === Number(ownerId)) {
    return null; // Owner viewing their own listing
  }

  return AnimalModel.incrementViews(animalId);
};
