// config/redis.js
// --------------------------------------------------
// Centralized Redis client configuration.
// All Redis operations go through the helpers here.
// Redis is used as a cache only — MongoDB is the
// source of truth for all permanent data.
// --------------------------------------------------

import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create a single Redis client instance (reused across the whole app)
const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

// Log connection lifecycle events
redisClient.on("connect",     () => console.log("🔄 Redis connecting..."));
redisClient.on("ready",       () => console.log("✅ Redis Connected Successfully"));
redisClient.on("error",  (err) => console.error("❌ Redis Error:", err.message));
redisClient.on("reconnecting", () => console.log("⚠️  Redis reconnecting..."));

// ─── Connect ──────────────────────────────────────
// Call this once at server startup (see app.js)
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    // Don't crash the server if Redis is unavailable.
    // The app will fall back to querying MongoDB directly.
    console.error("❌ Redis connection failed:", err.message);
  }
};

// ─── Disconnect ───────────────────────────────────
// Call this on server shutdown (see server.js)
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("🔌 Redis connection closed");
    }
  } catch (err) {
    console.error("Error closing Redis:", err.message);
  }
};

// ─── Helpers ──────────────────────────────────────

/**
 * Get a cached value by key.
 * Returns parsed JSON data, or null on miss / Redis offline.
 */
export const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`⚠️  Redis getCache failed [${key}]:`, err.message);
    return null; // Fall back to DB — don't throw
  }
};

/**
 * Store a value in cache with a TTL (in seconds).
 * Silently skips if Redis is offline.
 */
export const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(data), { EX: ttlSeconds });
  } catch (err) {
    console.warn(`⚠️  Redis setCache failed [${key}]:`, err.message);
  }
};

/**
 * Delete one or more cached keys (cache invalidation).
 * Call this whenever the underlying data changes in MongoDB.
 */
export const deleteCache = async (...keys) => {
  try {
    if (!redisClient.isOpen) return;
    const validKeys = keys.filter(Boolean);
    if (validKeys.length > 0) {
      await redisClient.del(validKeys);
    }
  } catch (err) {
    console.warn(`⚠️  Redis deleteCache failed [${keys.join(", ")}]:`, err.message);
  }
};

export default redisClient;
