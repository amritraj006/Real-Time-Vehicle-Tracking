// --------------------------------------------------
// Express app setup.
// - Loads environment variables
// - Connects to MongoDB and Redis
// - Configures CORS
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

// --------------------------------------------------
// Load environment variables
// --------------------------------------------------

dotenv.config();

// --------------------------------------------------
// Database connections
// --------------------------------------------------

connectDB();
connectRedis();

// --------------------------------------------------
// Create Express app
// --------------------------------------------------

const app = express();

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Example: Postman or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow only origins listed in ALLOWED_ORIGINS
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS blocked origin: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    credentials: true,
  })
);

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json());

// --------------------------------------------------
// Inngest
// --------------------------------------------------

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

// --------------------------------------------------
// REST API Routes
// --------------------------------------------------

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/users", userRoutes);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).send("🚗 Real-Time Vehicle Tracking API Running");
});

// --------------------------------------------------
// Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------------------------------------
// Export app
// --------------------------------------------------

export default app;