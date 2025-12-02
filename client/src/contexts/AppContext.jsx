import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

  return (
    <AppContext.Provider value={{ url, socket }}>
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
