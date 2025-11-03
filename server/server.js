// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Vehicle from "./models/vehicleModel.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define FRONTEND URL
const FRONTEND_URL = "https://real-time-vehicle-tracking.onrender.com";

// ✅ Common CORS options
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST"],
  credentials: true,
};

// ✅ Apply CORS for REST API
app.use(cors(corsOptions));

// ✅ Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// ✅ Initialize Socket.io with same CORS options
const io = new Server(server, { cors: corsOptions });

// ✅ MongoDB seeding (if empty)
const initializeVehicles = async () => {
  try {
    const count = await Vehicle.countDocuments();
    if (count === 0) {
      await Vehicle.insertMany([
        { vehicleId: "V001", name: "Car 1", lat: 28.6139, lng: 77.2090 },
        { vehicleId: "V002", name: "Bus 1", lat: 28.7041, lng: 77.1025 },
      ]);
      console.log("✅ Sample vehicles inserted");
    }
  } catch (error) {
    console.error("❌ Error initializing vehicles:", error);
  }
};
initializeVehicles();

// ✅ Simulate vehicle location updates every 5s
setInterval(async () => {
  try {
    const vehicles = await Vehicle.find();
    for (const v of vehicles) {
      v.lat += (Math.random() - 0.5) * 0.01;
      v.lng += (Math.random() - 0.5) * 0.01;
      v.updatedAt = new Date();
      await v.save();

      // Send live update to frontend
      io.emit("locationUpdate", {
        vehicleId: v.vehicleId,
        lat: v.lat,
        lng: v.lng,
      });
    }
  } catch (err) {
    console.error("❌ Error updating vehicle locations:", err);
  }
}, 5000);

// ✅ REST endpoint to get all vehicles
app.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
