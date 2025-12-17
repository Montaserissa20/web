// src/models/announcement.model.js
const prisma = require('../config/prismaClient');

function mapAnnouncement(db) {
  if (!db) return null;

  return {
    id: String(db.id),
    title: db.title,
    content: db.content,
    publishDate: (db.published_at ?? db.created_at).toISOString(),
    isVisible: db.is_visible ?? true,
    createdBy: db.created_by ? String(db.created_by) : 'Admin',
    createdAt: db.created_at.toISOString(),
    updatedAt: db.updated_at.toISOString(),
  };
}

exports.getAll = async () => {
  const rows = await prisma.announcements.findMany({
    orderBy: { created_at: 'desc' },
  });
  return rows.map(mapAnnouncement);
};

exports.getPublic = async () => {
  const rows = await prisma.announcements.findMany({
    where: { is_visible: true },
    orderBy: { published_at: 'desc' },
  });
  return rows.map(mapAnnouncement);
};

exports.getById = async (id) => {
  const row = await prisma.announcements.findUnique({
    where: { id: Number(id) },
  });
  return mapAnnouncement(row);
};

exports.create = async ({ title, content, publishDate, isVisible, imageUrl, userId }) => {
  const row = await prisma.announcements.create({
    data: {
      title,
      content,
      image_url: imageUrl ?? null,
      published_at: publishDate ? new Date(publishDate) : new Date(),
      is_visible: isVisible ?? true,
      created_by: userId ?? null,
    },
  });
  return mapAnnouncement(row);
};

exports.update = async (id, { title, content, publishDate, isVisible, imageUrl }) => {
  const row = await prisma.announcements.update({
    where: { id: Number(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(publishDate !== undefined && { published_at: new Date(publishDate) }),
      ...(isVisible !== undefined && { is_visible: isVisible }),
      ...(imageUrl !== undefined && { image_url: imageUrl }),
      updated_at: new Date(),
    },
  });
  return mapAnnouncement(row);
};

exports.remove = async (id) => {
  await prisma.announcements.delete({ where: { id: Number(id) } });
};
