// services/user.service.js
// --------------------------------------------------
// All user-related business logic.
// Used by the user controller and Inngest functions.
// --------------------------------------------------

import User from "../models/UserModel.js";
import { getCache, setCache, deleteCache } from "../config/redis.js";

// Cache key for the full user list
export const USERS_CACHE_KEY = "cache:users:all";
const USERS_CACHE_TTL = 300; // 5 minutes — user list changes infrequently

// ─── Get All Users ────────────────────────────────
// Used by the admin dashboard to display all users
export const getAllUsers = async () => {
  // Serve from cache if available
  const cached = await getCache(USERS_CACHE_KEY);
  if (cached) return cached;

  const users = await User.find({}, "-__v").sort({ createdAt: -1 });

  // Cache for 5 minutes
  await setCache(USERS_CACHE_KEY, users, USERS_CACHE_TTL);

  return users;
};

// ─── Invalidate User Cache ────────────────────────
// Call this whenever user data changes (via Inngest webhooks)
export const invalidateUserCache = async () => {
  await deleteCache(USERS_CACHE_KEY);
};
