import http from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";
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
