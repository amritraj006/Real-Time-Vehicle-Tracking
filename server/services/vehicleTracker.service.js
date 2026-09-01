// services/vehicleTracker.service.js
// --------------------------------------------------
// Background vehicle tracking service for demo & live simulation.
// Smoothly moves all active vehicles in MongoDB, updates route trails,
// and broadcasts real-time locationUpdate events via Socket.IO.
// --------------------------------------------------

import Vehicle from "../models/VehicleModel.js";
import { getIO } from "../config/socket.js";

const INTERVAL_MS = 3000; // Broadcast update every 3 seconds
const MAX_ROUTE = 60; // Keep last 60 coordinates for crisp polyline trail

// Speed ranges in km/h by vehicle type
const SPEED_PROFILES = {
  car: { min: 35, max: 65, step: 0.00028 },
  bike: { min: 25, max: 48, step: 0.00022 },
  truck: { min: 30, max: 55, step: 0.00024 },
  bus: { min: 25, max: 50, step: 0.00022 },
};

// In-memory runtime state for smooth directional motion
const vehicleState = new Map();

// Compute the new position and heading for a vehicle
const moveVehicle = (vehicle) => {
  const type = vehicle.type || "car";
  const profile = SPEED_PROFILES[type] || SPEED_PROFILES.car;

  // Initialize or fetch current state (bearing & target speed)
  let state = vehicleState.get(vehicle.vehicleId);
  if (!state) {
    state = {
      bearing: Math.floor(Math.random() * 360),
      speed: Math.floor(Math.random() * (profile.max - profile.min) + profile.min),
      battery: 95,
    };
    vehicleState.set(vehicle.vehicleId, state);
  }

  // 20% chance of small realistic heading turn (±15 degrees)
  if (Math.random() < 0.2) {
    const turn = (Math.random() - 0.5) * 30;
    state.bearing = (state.bearing + turn + 360) % 360;
  }

  // Slight speed fluctuation for realism
  state.speed = Math.min(
    profile.max,
    Math.max(profile.min, state.speed + (Math.random() - 0.5) * 6)
  );

  // Slow battery drain
  state.battery = Math.max(20, (state.battery - 0.02).toFixed(1));

  // Calculate new lat/lng using trigonometric bearing
  const radians = (state.bearing * Math.PI) / 180;
  const newLat = vehicle.lat + profile.step * Math.cos(radians);
  const newLng = vehicle.lng + profile.step * Math.sin(radians);

  vehicle.lat = Number(newLat.toFixed(6));
  vehicle.lng = Number(newLng.toFixed(6));

  // Update route history
  if (!Array.isArray(vehicle.route)) {
    vehicle.route = [];
  }
  vehicle.route.push({ lat: vehicle.lat, lng: vehicle.lng, timestamp: new Date() });
  if (vehicle.route.length > MAX_ROUTE) {
    vehicle.route.shift();
  }

  vehicle.updatedAt = new Date();

  return {
    bearing: Math.round(state.bearing),
    speed: Math.round(state.speed),
    battery: parseFloat(state.battery),
  };
};

// ─── Start Vehicle Tracking Loop ──────────────────
export const startVehicleTracking = () => {
  console.log("🚗 Real-Time Vehicle Simulation & Live Tracker service started.");

  setInterval(async () => {
    try {
      let io;
      try {
        io = getIO();
      } catch {
        // Socket.IO not initialized yet
        return;
      }

      const vehicles = await Vehicle.find();
      if (!vehicles || vehicles.length === 0) return;

      for (const vehicle of vehicles) {
        try {
          const telemetry = moveVehicle(vehicle);
          await vehicle.save();

          // Broadcast location update to all connected clients & dashboards
          io.emit("locationUpdate", {
            vehicleId: vehicle.vehicleId,
            name: vehicle.name,
            type: vehicle.type,
            userId: vehicle.userId,
            lat: vehicle.lat,
            lng: vehicle.lng,
            speed: telemetry.speed,
            heading: telemetry.bearing,
            battery: telemetry.battery,
            route: vehicle.route,
            updatedAt: vehicle.updatedAt,
          });
        } catch (err) {
          console.warn(`⚠️ Skipped vehicle ${vehicle.vehicleId}:`, err.message);
        }
      }
    } catch (err) {
      console.error("❌ Vehicle tracker interval error:", err.message);
    }
  }, INTERVAL_MS);
};
