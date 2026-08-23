// routes/dashboardRoutes.js
// --------------------------------------------------
// Maps dashboard API endpoints to their controllers.
// --------------------------------------------------

import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats); // GET /api/dashboard/stats

export default router;
