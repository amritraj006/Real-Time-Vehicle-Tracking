// services/vehicleTracker.service.js
import Vehicle from "../models/VehicleModel.js";
import { getIO } from "../config/socket.js";

export const startVehicleTracking = () => {
  const io = getIO();

  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find();

      for (const v of vehicles) {
        try {
          // 🔧 Fix missing direction
          if (typeof v.direction !== "number") {
            v.direction = Math.random() * 360;
          }

          const SPEED = 0.0002;

          // 🔄 Random turn
          if (Math.random() < 0.15) {
            v.direction += (Math.random() - 0.5) * 25;
          }

          const rad = (v.direction * Math.PI) / 180;

          // 🚗 Move
          v.lat += SPEED * Math.cos(rad);
          v.lng += SPEED * Math.sin(rad);

          // 🛣 Route history
          v.route.push({ lat: v.lat, lng: v.lng });
          if (v.route.length > 100) v.route.shift();

          v.updatedAt = new Date();
          await v.save();

          // 📡 Emit update
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
          console.warn(
            `⚠️ Vehicle skipped ${v.vehicleId}`,
            vehicleError.message
          );
        }
      }
    } catch (error) {
      console.error("❌ Interval error:", error);
    }
  }, 5000);
};
