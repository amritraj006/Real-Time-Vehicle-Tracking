import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";

const AppContext = createContext();

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

      const fetchUsers = async () => {
        try {
          const res = await fetch(`${url}/users`);
          const data = await res.json();
          setUsers(data);
        }
        catch (error) {
          console.error("Error fetching users:", error);
        }
      }

    useEffect(() => {
      fetchUsers();
    },[])

    const totalUsers = users.length;

  return (
    <AppContext.Provider value={{ url, socket, frontendUrl, users, totalUsers }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
