import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";
import { getCache, setCache } from "../config/redis.js";

const DASHBOARD_STATS_CACHE_KEY = "cache:dashboard:stats";
const STATS_CACHE_TTL_SECONDS = 10; // 10 seconds cache to match active vehicle calculation window

export const getDashboardStats = async (req, res) => {
  try {
    // ⚡ Check Redis cache first to avoid 4 heavy database queries
    const cachedStats = await getCache(DASHBOARD_STATS_CACHE_KEY);
    if (cachedStats) {
      return res.json(cachedStats);
    }

    // 1️⃣ Total users
    const totalUsers = await User.countDocuments();

    // 2️⃣ Total vehicles added ever (sum of all user vehicles)
    const users = await User.find({}, "vehicles");
    const totalVehiclesAdded = users.reduce((sum, user) => {
      return sum + (user.vehicles?.length || 0);
    }, 0);

    // 3️⃣ Active vehicles = updated within last 10 seconds
    const TEN_SECONDS = 1000 * 10;
    const endTime = new Date(Date.now() - TEN_SECONDS);

    const activeVehicles = await Vehicle.countDocuments({
      updatedAt: { $gte: endTime }
    });

    // 4️⃣ Total vehicles in database (tracking vehicles)
    const totalTrackedVehicles = await Vehicle.countDocuments();

    const stats = {
      totalUsers,
      totalVehiclesAdded,
      totalTrackedVehicles,
      activeVehicles
    };

    // Cache computed stats in Redis for 10 seconds
    await setCache(DASHBOARD_STATS_CACHE_KEY, stats, STATS_CACHE_TTL_SECONDS);

    res.json(stats);

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

