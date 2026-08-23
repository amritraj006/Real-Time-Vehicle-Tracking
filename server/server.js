// server.js
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

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Attach Express app to the HTTP server
const server = http.createServer(app);

// Initialize Socket.IO on the same server instance
initSocket(server);

// Start the background vehicle movement loop
startVehicleTracking();

// Start listening for incoming requests
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running in [${NODE_ENV}] mode on port ${PORT}`);
});

// ─── Graceful Shutdown ────────────────────────────
// Cleanly close Redis and HTTP server on process exit
const shutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received — shutting down...`);
  await disconnectRedis();
  server.close(() => {
    console.log("👋 HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ─── Process Error Handlers ───────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  shutdown("uncaughtException");
});
