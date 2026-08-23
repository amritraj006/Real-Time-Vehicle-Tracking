import http from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";
import { disconnectRedis } from "./config/redis.js";
import { startVehicleTracking } from "./services/vehicleTracker.service.js";

const server = http.createServer(app);

// 🔌 Initialize Socket.IO
initSocket(server);

// ▶️ Start vehicle movement service
startVehicleTracking();

const PORT = process.env.PORT || 5001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down server gracefully...");
  await disconnectRedis();
  server.close(() => {
    console.log("👋 HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
