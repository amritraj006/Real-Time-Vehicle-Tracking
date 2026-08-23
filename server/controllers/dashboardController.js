// controllers/dashboardController.js
// --------------------------------------------------
// Thin HTTP layer for dashboard stats endpoint.
// All business logic lives in dashboard.service.js.
// --------------------------------------------------

import * as dashboardService from "../services/dashboard.service.js";

// GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
