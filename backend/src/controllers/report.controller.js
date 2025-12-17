// src/controllers/report.controller.js
const ReportService = require('../services/report.service');

// POST /api/reports - Create a new report
exports.create = async (req, res) => {
  try {
    const { animalId, reason } = req.body;
    const userId = req.user?.id || null;

    if (!animalId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Animal ID and reason are required',
      });
    }

    const report = await ReportService.createReport({ animalId, userId, reason });
    res.status(201).json({ success: true, data: report, message: 'Report submitted successfully' });
  } catch (err) {
    console.error('create report error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to submit report' });
  }
};

// GET /api/reports - Get all reports (admin/moderator)
exports.getAll = async (_req, res) => {
  try {
    const reports = await ReportService.getAllReports();
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('getAll reports error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// GET /api/reports/:id - Get report by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportService.getReportById(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('getById report error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// PATCH /api/reports/:id/status - Update report status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const report = await ReportService.updateReportStatus(id, status);
    res.json({ success: true, data: report, message: `Report marked as ${status}` });
  } catch (err) {
    console.error('updateStatus report error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update report' });
  }
};

