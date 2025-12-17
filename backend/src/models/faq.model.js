// src/models/faq.model.js
const prisma = require('../config/prismaClient');

function mapFaq(db) {
  if (!db) return null;
  return {
    id: String(db.id),
    question: db.question,
    answer: db.answer,
    category: db.category ?? 'General',
    order: db.order_index ?? 0,
    isVisible: db.is_visible ?? true,
    createdAt: db.created_at.toISOString(),
    updatedAt: db.updated_at.toISOString(),
  };
}

exports.getAll = async () => {
  const rows = await prisma.faq.findMany({
    orderBy: { order_index: 'asc' },
  });
  return rows.map(mapFaq);
};

exports.getPublic = async () => {
  const rows = await prisma.faq.findMany({
    where: { is_visible: true },
    orderBy: { order_index: 'asc' },
  });
  return rows.map(mapFaq);
};

exports.getById = async (id) => {
  const row = await prisma.faq.findUnique({ where: { id: Number(id) } });
  return mapFaq(row);
};

exports.create = async ({ question, answer, category, order, isVisible }) => {
  const row = await prisma.faq.create({
    data: {
      question,
      answer,
      category: category ?? 'General',
      order_index: order ?? 0,
      is_visible: isVisible ?? true,
    },
  });
  return mapFaq(row);
};

exports.update = async (id, { question, answer, category, order, isVisible }) => {
  const row = await prisma.faq.update({
    where: { id: Number(id) },
    data: {
      ...(question !== undefined && { question }),
      ...(answer !== undefined && { answer }),
      ...(category !== undefined && { category }),
      ...(order !== undefined && { order_index: order }),
      ...(isVisible !== undefined && { is_visible: isVisible }),
      updated_at: new Date(),
    },
  });
  return mapFaq(row);
};

exports.remove = async (id) => {
  await prisma.faq.delete({ where: { id: Number(id) } });
};
