// controllers/vehicle.controller.js
// --------------------------------------------------
// Thin HTTP layer — handles request/response only.
// All business logic lives in vehicle.service.js.
//
// Flow: Route → Controller → Service → DB/Redis
// --------------------------------------------------

import * as vehicleService from "../services/vehicle.service.js";

// GET /api/vehicles/active
export const getActiveVehicles = async (req, res) => {
  try {
    const data = await vehicleService.getActiveVehicles();
    res.json(data);
  } catch (err) {
    console.error("getActiveVehicles error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/vehicles/:userId
export const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const vehicles = await vehicleService.getVehiclesByUser(userId);
    res.status(200).json(vehicles);
  } catch (err) {
    console.error("getVehiclesByUser error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/vehicles/track/:vehicleId
export const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await vehicleService.getVehicleById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, vehicle });
  } catch (err) {
    console.error("getVehicleById error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/vehicles/add
export const addVehicle = async (req, res) => {
  try {
    const { vehicleId, name, type, lat, lng, userId } = req.body;

    // Basic input validation
    if (!vehicleId || !name || !lat || !lng || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await vehicleService.addVehicle({ vehicleId, name, type, lat, lng, userId });

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result.vehicle);
  } catch (err) {
    console.error("addVehicle error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/vehicles/:userId/:vehicleId
export const deleteVehicle = async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;
    const deleted = await vehicleService.deleteVehicle({ userId, vehicleId });

    if (!deleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("deleteVehicle error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
