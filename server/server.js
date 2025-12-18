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

        // 🔧 Fix missing direction (VERY IMPORTANT)
        if (typeof v.direction !== "number") {
          v.direction = Math.random() * 360;
        }

        const SPEED = 0.0002;

        // 🔄 Occasionally turn
        if (Math.random() < 0.15) {
          v.direction += (Math.random() - 0.5) * 25;
        }

        const rad = (v.direction * Math.PI) / 180;

        // 🚗 Move forward
        v.lat += SPEED * Math.cos(rad);
        v.lng += SPEED * Math.sin(rad);

        // 🛣 Save route
        v.route.push({ lat: v.lat, lng: v.lng });
        if (v.route.length > 100) v.route.shift();

        v.updatedAt = new Date();
        await v.save();

        io.emit("locationUpdate", {
          vehicleId: v.vehicleId,
          name: v.name,
          type: v.type,
          userId: v.userId,
          lat: v.lat,
          lng: v.lng,
          route: v.route,
        });

      } catch (vehicleError) {
        console.warn(`⚠️ Vehicle skipped ${v.vehicleId}`, vehicleError.message);
      }
    }
  } catch (error) {
    console.error("❌ Interval error:", error);
  }
}, 5000);



app.get("/", (req, res) => res.send("🚗 Real-Time Vehicle Tracking API Running"));

const PORT = process.env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
