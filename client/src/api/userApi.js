import api from "./axios";

/**
 * Fetch all registered users in the platform.
 */
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};
