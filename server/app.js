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

import vehicleRoutes   from "./routes/vehicleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes      from "./routes/userRoutes.js";

// Load environment variables from .env
dotenv.config();

// Connect to databases at startup
connectDB();
connectRedis();

const app = express();

// ─── Middleware ───────────────────────────────────
app.use(express.json()); // Parse JSON request bodies

const isProduction = process.env.NODE_ENV === "production";

const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  }
  if (process.env.CLIENT_URL) {
    const origins = [process.env.CLIENT_URL];
    if (process.env.ADMIN_CLIENT_URL) origins.push(process.env.ADMIN_CLIENT_URL);
    return origins;
  }
  // In development, allow all origins if not explicitly configured
  return isProduction
    ? [
        "https://real-time-vehicle-tracking-1.onrender.com",
        "https://real-time-vehicle-tracking-admin.onrender.com",
      ]
    : "*";
};

app.use(cors({
  origin:  getAllowedOrigins(),
  methods: "GET,POST,PUT,DELETE",
}));

// ─── Inngest (Background Jobs) ────────────────────
app.use("/api/inngest", serve({ client: inngest, functions }));

// ─── REST API Routes ──────────────────────────────
app.use("/api/vehicles",  vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users",     userRoutes);

// ─── Health Checks ────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("🚗 Real-Time Vehicle Tracking API Running");
});

// ─── Centralized Error Handling ───────────────────
app.use((err, req, res, next) => {
  console.error("❌ Application Error:", err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    error: isDev ? err.message || "Internal Server Error" : "Internal Server Error",
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
});

export default app;
