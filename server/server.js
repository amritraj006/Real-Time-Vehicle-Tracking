// --------------------------------------------------
// HTTP server entry point.
// - Creates the HTTP server from the Express app
// - Initializes Socket.IO
// - Starts the background vehicle tracking loop
// - Handles clean shutdown on SIGINT / SIGTERM
// --------------------------------------------------

import http from "http";

import app from "./app.js";

import { initSocket } from "./config/socket.js";
import { disconnectRedis } from "./config/redis.js";
import { startVehicleTracking } from "./services/vehicleTracker.service.js";

// --------------------------------------------------
// Server configuration
// --------------------------------------------------

const PORT = process.env.PORT || 5001;

// --------------------------------------------------
// Create HTTP server
// --------------------------------------------------

const server = http.createServer(app);

// --------------------------------------------------
// Initialize Socket.IO
// --------------------------------------------------

initSocket(server);

// --------------------------------------------------
// Start vehicle tracking
// --------------------------------------------------

startVehicleTracking();

// --------------------------------------------------
// Start server
// --------------------------------------------------

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔐 Allowed origins: ${process.env.ALLOWED_ORIGINS || "None"}`);
});

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------

const shutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received — shutting down...`);

  try {
    // Disconnect Redis
    await disconnectRedis();

    // Close HTTP server
    server.close(() => {
      console.log("👋 HTTP server closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Shutdown error:", error);
    process.exit(1);
  }
};

// --------------------------------------------------
// Process signals
// --------------------------------------------------

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));