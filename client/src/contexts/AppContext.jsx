/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useMemo, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getUsers } from "../api/userApi";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Backend API URL
  const url =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking.onrender.com/api"
      : "http://localhost:5001/api";

  // Backend Socket URL
  const socketUrl =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking.onrender.com"
      : "http://localhost:5001";

  // Initialize socket connection once
  const socket = useMemo(
    () => io(socketUrl, { transports: ["websocket", "polling"] }),
    [socketUrl]
  );

  const frontendUrl =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking-frontend.onrender.com"
      : "http://localhost:5173";

  // Load all registered users
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersData();
  }, []);

  const totalUsers = users.length;

  return (
    <AppContext.Provider value={{ url, socket, frontendUrl, users, totalUsers }}>
      {children}
    </AppContext.Provider>
  );
};

// Re-export for backward compatibility
export { useAppContext } from "../hooks/useAppContext";
