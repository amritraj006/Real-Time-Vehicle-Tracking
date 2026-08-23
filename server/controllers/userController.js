import User from "../models/UserModel.js";
import { getCache, setCache } from "../config/redis.js";

export const USERS_ALL_CACHE_KEY = "cache:users:all";
const USERS_CACHE_TTL_SECONDS = 300; // 5 minutes cache for user list

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // ⚡ Check Redis cache first to serve instant user list
    const cachedUsers = await getCache(USERS_ALL_CACHE_KEY);
    if (cachedUsers) {
      return res.json(cachedUsers);
    }

    const users = await User.find({}, "-__v").sort({ createdAt: -1 }); // Exclude __v, newest first

    // Cache the user list for 5 minutes
    await setCache(USERS_ALL_CACHE_KEY, users, USERS_CACHE_TTL_SECONDS);

    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

