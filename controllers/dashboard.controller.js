const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

const getSummary = async (req, res, next) => {
    try {
        const summary = await dashboardService.getDashboardSummary();
        return successResponse(res, summary, 'Dashboard summary retrieved successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
  getSummary,
};
