// config/socket.js
// --------------------------------------------------
// Socket.IO setup.
// - initSocket() wires Socket.IO to the HTTP server.
// - getIO() is used by other files to emit events.
// --------------------------------------------------

import { Server } from "socket.io";

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
      ],
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
