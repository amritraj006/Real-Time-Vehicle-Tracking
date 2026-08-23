// services/vehicle.service.js
// --------------------------------------------------
// All vehicle-related business logic lives here.
// Controllers call these functions and return the result.
//
// Pattern used:
//   1. Check Redis cache
//   2. On miss → query MongoDB
//   3. Store result in Redis
//   4. On create/delete → invalidate relevant cache keys
// --------------------------------------------------

import Vehicle from "../models/VehicleModel.js";
import User from "../models/UserModel.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";

// ─── Cache Keys ───────────────────────────────────
// Centralizing keys avoids typos across files
const CACHE_KEYS = {
  active:          "cache:vehicles:active",
  byUser: (id)  => `cache:vehicles:user:${id}`,
  byId:   (id)  => `cache:vehicle:${id}`,
};

// ─── Cache TTLs (in seconds) ──────────────────────
const TTL = {
  active:   5,   // Active vehicles change every 5s (tracker interval)
  byUser:   60,  // User's vehicle list rarely changes
  byId:     15,  // Single vehicle lookup (tracked live by WebSocket anyway)
};

// ─── Get Active Vehicles ──────────────────────────
// Returns vehicles updated within the last 10 seconds
export const getActiveVehicles = async () => {
  // Check cache first
  const cached = await getCache(CACHE_KEYS.active);
  if (cached) return cached;

  const TEN_SECONDS = 10_000;
  const since = new Date(Date.now() - TEN_SECONDS);

  const vehicles = await Vehicle.find({ updatedAt: { $gte: since } })
    .select("vehicleId name type lat lng route updatedAt");

  const result = { vehicles };

  // Cache for 5 seconds (vehicles update every 5s via tracker)
  await setCache(CACHE_KEYS.active, result, TTL.active);

  return result;
};

// ─── Get Vehicles By User ─────────────────────────
export const getVehiclesByUser = async (userId) => {
  const cacheKey = CACHE_KEYS.byUser(userId);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const vehicles = await Vehicle.find({ userId })
    .select("vehicleId name type lat lng route");

  // Cache for 60 seconds
  await setCache(cacheKey, vehicles, TTL.byUser);

  return vehicles;
};

// ─── Get Single Vehicle By ID ─────────────────────
export const getVehicleById = async (vehicleId) => {
  const cacheKey = CACHE_KEYS.byId(vehicleId);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const vehicle = await Vehicle.findOne({ vehicleId });

  if (!vehicle) return null;

  // Cache for 15 seconds
  await setCache(cacheKey, vehicle, TTL.byId);

  return vehicle;
};

// ─── Add Vehicle ──────────────────────────────────
export const addVehicle = async ({ vehicleId, name, type, lat, lng, userId }) => {
  // Check for duplicate
  const existing = await Vehicle.findOne({ vehicleId });
  if (existing) return { error: "Vehicle already exists" };

  // Save to MongoDB
  const vehicle = await Vehicle.create({
    vehicleId, name, type, lat, lng, userId,
    route: [{ lat, lng }], // Start route from initial position
  });

  // Add vehicle name to user's vehicles array
  await User.findByIdAndUpdate(
    userId,
    { $push: { vehicles: vehicle.name } },
    { new: true }
  );

  // Invalidate affected caches — data has changed in DB
  await deleteCache(
    CACHE_KEYS.byUser(userId),
    CACHE_KEYS.active,
    "cache:dashboard:stats",
    "cache:users:all"
  );

  return { vehicle };
};

// ─── Delete Vehicle ───────────────────────────────
export const deleteVehicle = async ({ userId, vehicleId }) => {
  const vehicle = await Vehicle.findOneAndDelete({ userId, vehicleId });

  if (!vehicle) return null;

  // Invalidate all related caches
  await deleteCache(
    CACHE_KEYS.byUser(userId),
    CACHE_KEYS.byId(vehicleId),
    CACHE_KEYS.active,
    "cache:dashboard:stats",
    "cache:users:all"
  );

  return vehicle;
};
