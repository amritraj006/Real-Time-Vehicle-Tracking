import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Backend API URL
  const url =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking.onrender.com/api"
      : "http://localhost:5001/api"; // FIXED

  // Backend Socket URL
  const socketUrl =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking.onrender.com"
      : "http://localhost:5001"; // FIXED

  // Initialize socket connection (runs ONCE)
  const socket = useMemo(
    () =>
      io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      }),
    [socketUrl]
  );




  const frontendUrl =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking-frontend.onrender.com"
      : "http://localhost:5173";

      const [isAdmin, setIsAdmin] = useState(false);

      const [users, setUsers] = useState([]);

      const fetchUsers = async () => {
        const res = await fetch(`${url}/users`);
        const data = await res.json();
        setUsers(data);
      }

      useEffect(() => {
        fetchUsers();
      })


  return (
    <AppContext.Provider value={{ url, socket, frontendUrl, isAdmin, setIsAdmin, users }}>
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
