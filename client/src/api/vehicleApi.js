import api from "./axios";

/**
 * Fetch all vehicles belonging to a specific user.
 * @param {string} userId - Clerk user ID
 */
export const getVehiclesByUser = async (userId) => {
  const response = await api.get(`/vehicles/${userId}`);
  return response.data;
};

/**
 * Add and register a new vehicle for a user.
 * @param {Object} vehicleData - { name, type, lat, lng, userId, vehicleId }
 */
export const addVehicle = async (vehicleData) => {
  const response = await api.post("/vehicles/add", vehicleData);
  return response.data;
};

/**
 * Delete a specific vehicle for a user.
 * @param {string} userId - Clerk user ID
 * @param {string} vehicleId - Unique vehicle identifier
 */
export const deleteVehicle = async (userId, vehicleId) => {
  const response = await api.delete(`/vehicles/${userId}/${vehicleId}`);
  return response.data;
};

/**
 * Fetch a single vehicle's details and live tracking state by its vehicle ID.
 * @param {string} vehicleId - Unique vehicle identifier
 */
export const getVehicleById = async (vehicleId) => {
  const response = await api.get(`/vehicles/track/${vehicleId}`);
  return response.data;
};

/**
 * Fetch currently active vehicles across the fleet.
 */
export const getActiveVehicles = async () => {
  const response = await api.get("/vehicles/active");
  return response.data;
};
