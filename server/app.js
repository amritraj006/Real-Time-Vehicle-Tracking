// app.js
// --------------------------------------------------
// Express app setup.
// - Loads environment variables
// - Connects to MongoDB and Redis
// - Registers middleware and routes
// --------------------------------------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { serve } from "inngest/express";

import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { inngest, functions } from "./inngest/index.js";

import vehicleRoutes from "./routes/vehicleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables from .env
dotenv.config();

// Connect to databases at startup
connectDB();
connectRedis();

const app = express();

// ─── Middleware ───────────────────────────────────
app.use(express.json()); // Parse JSON request bodies
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
}));

// ─── Inngest (Background Jobs) ────────────────────
app.use("/api/inngest", serve({ client: inngest, functions }));

// ─── REST API Routes ──────────────────────────────
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// ─── Health Check ─────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚗 Real-Time Vehicle Tracking API Running");
});

export default app;
