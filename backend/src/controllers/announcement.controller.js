// src/controllers/announcement.controller.js
const AnnouncementModel = require('../models/announcement.model');
const NotificationService = require('../services/notification.service');

// GET /api/announcements
exports.getAll = async (req, res) => {
  try {
    const data = await AnnouncementModel.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.error('getAll announcements error', err);
    res.status(500).json({ success: false, message: 'Failed to load announcements' });
  }
};

// GET /api/announcements/public
exports.getPublic = async (req, res) => {
  try {
    const data = await AnnouncementModel.getPublic();
    res.json({ success: true, data });
  } catch (err) {
    console.error('getPublic announcements error', err);
    res.status(500).json({ success: false, message: 'Failed to load announcements' });
  }
};

// POST /api/announcements
exports.create = async (req, res) => {
  try {
    const { title, content, publishDate, isVisible, imageUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Get userId from authenticated user (if available)
    const userId = req.user?.id || null;

    const announcement = await AnnouncementModel.create({
      title,
      content,
      publishDate,
      isVisible,
      imageUrl,
      userId,
    });

    // Send notification to all users about the new announcement
    if (isVisible !== false) {
      try {
        await NotificationService.notifyNewAnnouncement(title, announcement.id);
      } catch (notifErr) {
        console.error('Failed to send announcement notifications:', notifErr);
      }
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error('create announcement error', err);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
};

// PUT /api/announcements/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await AnnouncementModel.update(id, req.body);
    res.json({ success: true, data: announcement });
  } catch (err) {
    console.error('update announcement error', err);
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
};

// DELETE /api/announcements/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await AnnouncementModel.remove(id);
    res.json({ success: true, data: null, message: 'Announcement deleted' });
  } catch (err) {
    console.error('delete announcement error', err);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
};

// POST /api/announcements/upload-image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Construct the URL for the uploaded image
    const imageUrl = `/uploads/announcements/${req.file.filename}`;

    res.json({
      success: true,
      data: { imageUrl },
      message: 'Image uploaded successfully',
    });
  } catch (err) {
    console.error('upload announcement image error', err);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};
