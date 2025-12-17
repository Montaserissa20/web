const AnimalService = require('../services/animal.service');

exports.createListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listing = await AnimalService.createListing(userId, req.body);
    return res.status(201).json({ success: true, data: listing });
  } catch (err) {
    console.error('createListing error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const listing = await AnimalService.updateListing(userId, id, req.body);

    return res.json({
      success: true,
      data: listing,
      message: 'Listing updated',
    });
  } catch (err) {
    console.error('updateListing error:', err);
    const status =
      err.message === 'Listing not found'
        ? 404
        : err.message.includes('Not allowed')
          ? 403
          : 400;
    return res.status(status).json({ success: false, message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await AnimalService.deleteListingOwner(userId, id);

    return res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    console.error('deleteListing error:', err);
    const status =
      err.message === 'Listing not found'
        ? 404
        : err.message.includes('Not allowed')
          ? 403
          : 400;
    return res.status(status).json({ success: false, message: err.message });
  }
};

exports.getPublicListings = async (_req, res) => {
  try {
    const listings = await AnimalService.getPublicListings();
    return res.json({ success: true, data: listings });
  } catch (err) {
    console.error('getPublicListings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await AnimalService.getUserListings(userId);
    return res.json({ success: true, data: listings });
  } catch (err) {
    console.error('getMyListings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your listings' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const listing = await AnimalService.getListingBySlug(slug);

    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });

    return res.json({ success: true, data: listing });
  } catch (err) {
    console.error('getBySlug error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // multer puts files on req.files
    const files = req.files || [];
    const imageUrls = files.map((f) => `/uploads/animals/${f.filename}`);

    const images = await AnimalService.uploadListingImages(userId, id, imageUrls);

    return res.status(201).json({ success: true, data: { images } });
  } catch (err) {
    console.error('uploadImages error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/animals/:id/view - Increment view count
exports.recordView = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id || null;

    await AnimalService.incrementViews(id, viewerId);

    return res.json({ success: true, message: 'View recorded' });
  } catch (err) {
    console.error('recordView error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record view' });
  }
};
