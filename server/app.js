import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
  })
);

// Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// REST APIs
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("🚗 Real-Time Vehicle Tracking API Running");
});

export default app;
