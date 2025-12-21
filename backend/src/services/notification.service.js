const NotificationModel = require('../models/notification.model');
const prisma = require('../config/prismaClient');

// Notification types
const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  ANNOUNCEMENT: 'announcement',
};

// Create a notification for new message
exports.notifyNewMessage = async (recipientId, senderName, conversationId) => {
  return NotificationModel.create({
    userId: recipientId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    link: `/dashboard/messages/${conversationId}`,
  });
};

// Create notification for listing approved
exports.notifyListingApproved = async (ownerId, listingTitle, listingId) => {
  return NotificationModel.create({
    userId: ownerId,
    type: NOTIFICATION_TYPES.LISTING_APPROVED,
    title: 'Listing Approved! 🎉',
    message: `Your listing "${listingTitle}" has been approved and is now visible to everyone.`,
    link: `/listings/${listingId}`,
  });
};

// Create notification for listing rejected
exports.notifyListingRejected = async (ownerId, listingTitle, reason) => {
  return NotificationModel.create({
    userId: ownerId,
    type: NOTIFICATION_TYPES.LISTING_REJECTED,
    title: 'Listing Rejected',
    message: `Your listing "${listingTitle}" was rejected. Reason: ${reason || 'No reason provided'}`,
    link: `/dashboard/listings`,
  });
};

// Create notifications for all users about a new announcement
exports.notifyNewAnnouncement = async (announcementTitle, announcementId) => {
  // Get all active users
  const users = await prisma.users.findMany({
    where: { is_banned: false },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  const notifications = users.map(user => ({
    userId: user.id,
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    title: 'New Announcement',
    message: announcementTitle,
    link: `/announcements`,
  }));

  return NotificationModel.createMany(notifications);
};

// Get notifications for a user
exports.getNotifications = async (userId, options = {}) => {
  return NotificationModel.getByUserId(userId, options);
};

// Get unread count
exports.getUnreadCount = async (userId) => {
  return NotificationModel.getUnreadCount(userId);
};

// Mark notification as read
exports.markAsRead = async (id, userId) => {
  return NotificationModel.markAsRead(id, userId);
};

// Mark all as read
exports.markAllAsRead = async (userId) => {
  return NotificationModel.markAllAsRead(userId);
};

// Delete notification
exports.deleteNotification = async (id, userId) => {
  return NotificationModel.delete(id, userId);
};

exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

