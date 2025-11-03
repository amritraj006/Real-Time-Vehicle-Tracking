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
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "https://real-time-vehicle-tracking-1.onrender.com" },
});

// ✅ Insert sample vehicles if DB empty
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

// ✅ Simulate location updates every 5 seconds
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

// ✅ Get all vehicles for initial map load
app.get("/vehicles", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
