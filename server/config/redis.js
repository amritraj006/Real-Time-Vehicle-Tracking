// config/redis.js
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client instance
const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

// Redis connection event listeners
redisClient.on("connect", () => {
  console.log("🔄 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Connected Successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisClient.on("reconnecting", () => {
  console.log("⚠️ Redis reconnecting...");
});

// Connect to Redis server
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error.message);
    // Do not terminate process; application will gracefully fall back to MongoDB
  }
};

// Gracefully close Redis connection
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("🔌 Redis connection closed cleanly");
    }
  } catch (error) {
    console.error("Error closing Redis connection:", error.message);
  }
};

/**
 * Helper: Retrieve cached data by key
 * Returns parsed JSON data if found, or null if key does not exist or Redis is offline.
 */
export const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`⚠️ Redis getCache error for key "${key}":`, error.message);
    return null;
  }
};

/**
 * Helper: Store data in cache with a TTL (Time To Live in seconds)
 */
export const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(data), {
      EX: ttlSeconds,
    });
  } catch (error) {
    console.warn(`⚠️ Redis setCache error for key "${key}":`, error.message);
  }
};

/**
 * Helper: Invalidate (delete) one or multiple cached keys
 */
export const deleteCache = async (...keys) => {
  try {
    if (!redisClient.isOpen || keys.length === 0) return;
    const validKeys = keys.filter(Boolean);
    if (validKeys.length > 0) {
      await redisClient.del(validKeys);
    }
  } catch (error) {
    console.warn(`⚠️ Redis deleteCache error for keys "${keys.join(", ")}":`, error.message);
  }
};

export default redisClient;
