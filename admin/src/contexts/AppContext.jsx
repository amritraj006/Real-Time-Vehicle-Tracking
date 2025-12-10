import React, { createContext, useContext, useMemo } from "react";
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

  return (
    <AppContext.Provider value={{ url, socket, frontendUrl }}>
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
