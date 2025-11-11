// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // ✅ MongoDB connection
import Vehicle from "./models/vehicleModel.js";

dotenv.config();
connectDB(); // ✅ Connect to MongoDB

const app = express();

// ✅ Proper CORS setup for Render & local development
app.use(
  cors({
    origin: [
      "https://real-time-vehicle-tracking-1.onrender.com", // frontend on Render
      "http://localhost:5173", // local dev (Vite default port)
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://real-time-vehicle-tracking-1.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
});

// ✅ Initialize DB with sample vehicles if empty
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

// ✅ Simulate live vehicle updates every 5 seconds
setInterval(async () => {
  try {
    const vehicles = await Vehicle.find();
    for (const v of vehicles) {
      const newLat = v.lat + (Math.random() - 0.5) * 0.01;
      const newLng = v.lng + (Math.random() - 0.5) * 0.01;

      v.lat = newLat;
      v.lng = newLng;
      v.updatedAt = new Date();
      await v.save();

      // Emit update to all clients
      io.emit("locationUpdate", {
        vehicleId: v.vehicleId,
        lat: newLat,
        lng: newLng,
      });
    }
  } catch (err) {
    console.error("❌ Error updating vehicle locations:", err);
  }
}, 5000);

// ✅ REST endpoint for initial vehicle data
app.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    console.error("❌ Error fetching vehicles:", err);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

// ✅ Render requires binding to process.env.PORT
const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);