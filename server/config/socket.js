// config/socket.js
// --------------------------------------------------
// Socket.IO setup.
// - initSocket() wires Socket.IO to the HTTP server.
// - getIO() is used by other files to emit events.
// --------------------------------------------------

import { Server } from "socket.io";

let io; // Shared Socket.IO instance

// Allowed CORS origins: can be specified via ALLOWED_ORIGINS (comma-separated) or CLIENT_URL in .env
const defaultOrigins = [
  "https://real-time-vehicle-tracking-1.onrender.com",
  "https://real-time-vehicle-tracking-admin.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  }
  if (process.env.CLIENT_URL) {
    const origins = [process.env.CLIENT_URL];
    if (process.env.ADMIN_CLIENT_URL) origins.push(process.env.ADMIN_CLIENT_URL);
    return origins;
  }
  return defaultOrigins;
};

// Initialize Socket.IO — call this once in server.js
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

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
