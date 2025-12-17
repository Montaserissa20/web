// src/models/report.model.js
const prisma = require('../config/prismaClient');

function mapReport(db) {
  if (!db) return null;
  return {
    id: String(db.id),
    animalId: String(db.animal_id),
    userId: db.user_id ? String(db.user_id) : null,
    reason: db.reason,
    status: db.status,
    createdAt: db.created_at.toISOString(),
  };
}

// Create a new report
exports.create = async ({ animalId, userId, reason }) => {
  const row = await prisma.reports.create({
    data: {
      animal_id: Number(animalId),
      user_id: userId ? Number(userId) : null,
      reason,
      status: 'open',
    },
  });
  return mapReport(row);
};

// Get all reports (for admin/moderator)
exports.getAll = async () => {
  const rows = await prisma.reports.findMany({
    orderBy: { created_at: 'desc' },
  });
  return rows.map(mapReport);
};

// Get reports by status
exports.getByStatus = async (status) => {
  const rows = await prisma.reports.findMany({
    where: { status },
    orderBy: { created_at: 'desc' },
  });
  return rows.map(mapReport);
};

// Get reports for a specific animal
exports.getByAnimalId = async (animalId) => {
  const rows = await prisma.reports.findMany({
    where: { animal_id: Number(animalId) },
    orderBy: { created_at: 'desc' },
  });
  return rows.map(mapReport);
};

// Update report status
exports.updateStatus = async (id, status) => {
  const row = await prisma.reports.update({
    where: { id: Number(id) },
    data: { status },
  });
  return mapReport(row);
};

// Get report by ID with animal and user info
exports.getByIdWithDetails = async (id) => {
  const report = await prisma.reports.findUnique({
    where: { id: Number(id) },
  });
  
  if (!report) return null;
  
  // Get animal info
  const animal = await prisma.animals.findUnique({
    where: { id: report.animal_id },
    select: { id: true, title: true, slug: true },
  });
  
  // Get reporter info if available
  let reporter = null;
  if (report.user_id) {
    reporter = await prisma.users.findUnique({
      where: { id: report.user_id },
      select: { id: true, name: true },
    });
  }
  
  return {
    ...mapReport(report),
    animal: animal ? { id: String(animal.id), title: animal.title, slug: animal.slug } : null,
    reporter: reporter ? { id: String(reporter.id), name: reporter.name } : null,
  };
};

// Get all reports with details (for moderator view)
exports.getAllWithDetails = async () => {
  const reports = await prisma.reports.findMany({
    orderBy: { created_at: 'desc' },
  });
  
  const detailedReports = await Promise.all(
    reports.map(async (report) => {
      const animal = await prisma.animals.findUnique({
        where: { id: report.animal_id },
        select: { id: true, title: true, slug: true },
      });
      
      let reporter = null;
      if (report.user_id) {
        reporter = await prisma.users.findUnique({
          where: { id: report.user_id },
          select: { id: true, name: true },
        });
      }
      
      return {
        ...mapReport(report),
        listingId: animal ? String(animal.id) : null,
        listingTitle: animal ? animal.title : 'Unknown',
        reporterId: reporter ? String(reporter.id) : null,
        reporterName: reporter ? reporter.name : 'Anonymous',
      };
    })
  );
  
  return detailedReports;
};

