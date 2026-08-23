// services/dashboard.service.js
// --------------------------------------------------
// Business logic for admin dashboard statistics.
// This endpoint runs 4 MongoDB queries, so caching
// it reduces database load significantly.
// --------------------------------------------------

import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import { getCache, setCache } from "../config/redis.js";

const STATS_CACHE_KEY = "cache:dashboard:stats";
const STATS_CACHE_TTL = 10; // 10 seconds — matches the "active vehicle" time window

// ─── Get Dashboard Stats ──────────────────────────
// Returns aggregated stats for the admin dashboard
export const getDashboardStats = async () => {
  // Serve from cache to skip 4 DB queries per request
  const cached = await getCache(STATS_CACHE_KEY);
  if (cached) return cached;

  // Total registered users
  const totalUsers = await User.countDocuments();

  // Total vehicles ever added — sum across all user.vehicles arrays
  const users = await User.find({}, "vehicles");
  const totalVehiclesAdded = users.reduce(
    (sum, user) => sum + (user.vehicles?.length || 0),
    0
  );

  // Active vehicles = updated within the last 10 seconds
  const TEN_SECONDS = 10_000;
  const since = new Date(Date.now() - TEN_SECONDS);
  const activeVehicles = await Vehicle.countDocuments({ updatedAt: { $gte: since } });

  // Total tracked vehicles in the system
  const totalTrackedVehicles = await Vehicle.countDocuments();

  const stats = { totalUsers, totalVehiclesAdded, totalTrackedVehicles, activeVehicles };

  // Cache for 10 seconds
  await setCache(STATS_CACHE_KEY, stats, STATS_CACHE_TTL);

  return stats;
};
