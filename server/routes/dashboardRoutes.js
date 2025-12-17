import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats); //Dashboard Routes

export default router;
