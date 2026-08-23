// services/vehicleTracker.service.js
// --------------------------------------------------
// Background service that simulates vehicle movement.
// Runs every 5 seconds, updates position in MongoDB,
// and broadcasts the new location to all connected
// Socket.IO clients via the "locationUpdate" event.
//
// This is kept independent from the REST API layer.
// --------------------------------------------------

import Vehicle from "../models/VehicleModel.js";
import { getIO } from "../config/socket.js";

const INTERVAL_MS  = 5000;   // How often vehicles move (5 seconds)
const SPEED        = 0.0002; // Movement speed in degrees per tick
const TURN_CHANCE  = 0.15;   // 15% chance of turning each tick
const TURN_DEGREES = 25;     // Max random turn angle (±12.5°)
const MAX_ROUTE    = 100;    // Max route history points stored per vehicle

// Compute the new position for a single vehicle
const moveVehicle = (vehicle) => {
  // Assign a random direction if not set
  if (typeof vehicle.direction !== "number") {
    vehicle.direction = Math.random() * 360;
  }

  // Occasionally apply a random turn
  if (Math.random() < TURN_CHANCE) {
    vehicle.direction += (Math.random() - 0.5) * TURN_DEGREES;
  }

  // Move in the current direction using basic trigonometry
  const radians = (vehicle.direction * Math.PI) / 180;
  vehicle.lat += SPEED * Math.cos(radians);
  vehicle.lng += SPEED * Math.sin(radians);

  // Append new position to route history and trim if too long
  vehicle.route.push({ lat: vehicle.lat, lng: vehicle.lng });
  if (vehicle.route.length > MAX_ROUTE) vehicle.route.shift();

  vehicle.updatedAt = new Date();
};

// ─── Start Vehicle Tracking ───────────────────────
// Call this once in server.js after Socket.IO is ready
export const startVehicleTracking = () => {
  const io = getIO();

  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find();

      for (const vehicle of vehicles) {
        try {
          moveVehicle(vehicle);
          await vehicle.save();

          // Broadcast updated position to all connected clients
          io.emit("locationUpdate", {
            vehicleId: vehicle.vehicleId,
            name:      vehicle.name,
            type:      vehicle.type,
            userId:    vehicle.userId,
            lat:       vehicle.lat,
            lng:       vehicle.lng,
            route:     vehicle.route,
          });
        } catch (err) {
          console.warn(`⚠️  Skipped vehicle ${vehicle.vehicleId}:`, err.message);
        }
      }
    } catch (err) {
      console.error("❌ Vehicle tracker error:", err.message);
    }
  }, INTERVAL_MS);
};
