// config/socket.js
// --------------------------------------------------
// Socket.IO setup.
// - initSocket() wires Socket.IO to the HTTP server.
// - getIO() is used by other files to emit events.
// --------------------------------------------------

import { Server } from "socket.io";
import { updateVehicleLocation } from "../services/vehicle.service.js";

let io; // Shared Socket.IO instance

// Initialize Socket.IO — call this once in server.js
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://real-time-vehicle-tracking-1.onrender.com",
        "https://real-time-vehicle-tracking-admin.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected for live tracking:", socket.id);

    // Listen for real-time GPS location updates from open client devices
    socket.on("updateLocation", async (data) => {
      try {
        const { vehicleId, lat, lng, speed, heading, userId } = data;
        if (!vehicleId || lat === undefined || lng === undefined) return;

        // Persist real-time location update in DB and cache
        const updatedVehicle = await updateVehicleLocation({
          vehicleId,
          lat,
          lng,
          speed,
          heading,
          userId,
        });

        if (updatedVehicle) {
          // Broadcast real location update to all connected clients & dashboards
          io.emit("locationUpdate", {
            vehicleId: updatedVehicle.vehicleId,
            name: updatedVehicle.name,
            type: updatedVehicle.type,
            userId: updatedVehicle.userId,
            lat: updatedVehicle.lat,
            lng: updatedVehicle.lng,
            speed: speed !== undefined ? speed : 0,
            heading: heading !== undefined ? heading : 0,
            route: updatedVehicle.route,
            updatedAt: updatedVehicle.updatedAt,
          });
        }
      } catch (err) {
        console.error("❌ Error handling updateLocation socket event:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
};

// Get the shared Socket.IO instance — used in services to emit events
export const getIO = () => {
  if (!io) throw new Error("❌ Socket.IO not initialized. Call initSocket() first.");
  return io;
};
