// Correct import with exact filename
import Vehicle from "../models/VehicleModel.js";
import User from "../models/UserModel.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";

// Cache TTL constants (in seconds)
const ACTIVE_VEHICLES_CACHE_KEY = "cache:vehicles:active";
const ACTIVE_VEHICLES_TTL = 5; // 5 seconds cache for active vehicles
const USER_VEHICLES_TTL = 60; // 60 seconds cache for user vehicle list
const SINGLE_VEHICLE_TTL = 15; // 15 seconds cache for single vehicle tracker lookup

export const getActiveVehicles = async (req, res) => {
  try {
    // ⚡ Check Redis cache for recent active vehicles
    const cachedActive = await getCache(ACTIVE_VEHICLES_CACHE_KEY);
    if (cachedActive) {
      return res.json(cachedActive);
    }

    const TEN_SECONDS = 10000;
    const sinceTime = new Date(Date.now() - TEN_SECONDS);

    const activeVehicles = await Vehicle.find({
      updatedAt: { $gte: sinceTime }
    }).select("vehicleId name type lat lng route updatedAt"); // ✅ route added

    const result = { vehicles: activeVehicles }; // FIXED 🔥🔥

    // Cache active vehicles for 5 seconds
    await setCache(ACTIVE_VEHICLES_CACHE_KEY, result, ACTIVE_VEHICLES_TTL);

    res.json(result);
  } catch (error) {
    console.error("Error fetching active vehicles:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Add new vehicle
export const addVehicle = async (req, res) => {
  try {
    const { vehicleId, name, type, lat, lng, userId } = req.body;

    if (!vehicleId || !name || !lat || !lng || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ vehicleId });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle already exists" });
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      vehicleId,
      name,
      type,
      lat,
      lng,
      userId,
      route: [{ lat, lng }], // ✅ start route from initial point
    });

    // Save ONLY vehicle name to user's vehicles list
    await User.findByIdAndUpdate(
      userId,
      { $push: { vehicles: vehicle.name } },
      { new: true }
    );

    // 🔄 Invalidate cached user vehicles, user list, and dashboard stats
    await deleteCache(
      `cache:vehicles:user:${userId}`,
      "cache:dashboard:stats",
      "cache:users:all",
      ACTIVE_VEHICLES_CACHE_KEY
    );

    return res.status(201).json(vehicle);

  } catch (error) {
    console.error("❌ Error adding vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all vehicles for a specific user
export const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `cache:vehicles:user:${userId}`;

    // ⚡ Check Redis cache first
    const cachedVehicles = await getCache(cacheKey);
    if (cachedVehicles) {
      return res.status(200).json(cachedVehicles);
    }

    const vehicles = await Vehicle.find({ userId })
      .select("vehicleId name type lat lng route"); // ✅ route added

    // Cache user's vehicles for 1 minute
    await setCache(cacheKey, vehicles, USER_VEHICLES_TTL);

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete specific vehicle by vehicleId and userId
export const deleteVehicle = async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;

    const vehicle = await Vehicle.findOneAndDelete({
      userId: userId,
      vehicleId: vehicleId,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // 🔄 Invalidate cached user vehicles, single vehicle, dashboard stats, and active vehicles
    await deleteCache(
      `cache:vehicles:user:${userId}`,
      `cache:vehicle:${vehicleId}`,
      "cache:dashboard:stats",
      "cache:users:all",
      ACTIVE_VEHICLES_CACHE_KEY
    );

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const cacheKey = `cache:vehicle:${vehicleId}`;

    // ⚡ Check Redis cache first
    const cachedVehicle = await getCache(cacheKey);
    if (cachedVehicle) {
      return res.json({ success: true, vehicle: cachedVehicle });
    }

    const vehicle = await Vehicle.findOne({ vehicleId });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    // Cache vehicle details for 15 seconds
    await setCache(cacheKey, vehicle, SINGLE_VEHICLE_TTL);

    res.json({ success: true, vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



