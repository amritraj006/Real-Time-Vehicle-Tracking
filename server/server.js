import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import Vehicle from "./models/vehicleModel.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://real-time-vehicle-tracking-1.onrender.com",
      "https://real-time-vehicle-tracking-admin.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],

  },
});
app.use("/api/inngest", serve({ client: inngest, functions })); 
// ✅ REST API
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
// ✅ Real-time updates every 5 sec
setInterval(async () => {
  try {
    const vehicles = await Vehicle.find();
    for (const v of vehicles) {
      try {
        // Randomly simulate small movement
        v.lat += (Math.random() - 0.5) * 0.001;
        v.lng += (Math.random() - 0.5) * 0.001;
        v.updatedAt = new Date();
        await v.save();

        // Emit with userId so frontend filters properly
        io.emit("locationUpdate", {
          name: v.name,
          type: v.type,
          userId: v.userId,
          vehicleId: v.vehicleId,
          lat: v.lat,
          lng: v.lng,
        });
      } catch (vehicleError) {
        // Skip vehicles that might have been deleted
        console.warn(`⚠️ Skipping update for vehicle ${v.vehicleId}:`, vehicleError.message);
        continue;
      }
    }
  } catch (error) {
    console.error("❌ Error in vehicle update interval:", error);
  }
}, 5000);

app.get("/", (req, res) => res.send("🚗 Real-Time Vehicle Tracking API Running"));

const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
