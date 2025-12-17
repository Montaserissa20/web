// src/services/report.service.js
const ReportModel = require('../models/report.model');

exports.createReport = async ({ animalId, userId, reason }) => {
  if (!animalId || !reason) {
    throw new Error('Animal ID and reason are required');
  }
  return ReportModel.create({ animalId, userId, reason });
};

exports.getAllReports = async () => {
  return ReportModel.getAllWithDetails();
};

exports.getReportsByStatus = async (status) => {
  const validStatuses = ['open', 'reviewing', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  return ReportModel.getByStatus(status);
};

exports.updateReportStatus = async (id, status) => {
  const validStatuses = ['open', 'reviewing', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  return ReportModel.updateStatus(id, status);
};

exports.getReportById = async (id) => {
  return ReportModel.getByIdWithDetails(id);
};

