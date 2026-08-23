import axios from "axios";

/**
 * Central Axios instance configured for API communication.
 * Base URL dynamically switches between production and local backend.
 */
const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://real-time-vehicle-tracking.onrender.com/api"
    : "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
