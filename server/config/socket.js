// config/socket.js
import { Server } from "socket.io";

let io;

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

export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized");
  }
  return io;
};
