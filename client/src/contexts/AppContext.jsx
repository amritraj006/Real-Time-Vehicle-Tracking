import React, { createContext, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const url =
    import.meta.env.MODE === "production"
      ? "https://real-time-vehicle-tracking.onrender.com/api"
      : "http://localhost:5001/api";

  return (
    <AppContext.Provider value={{ url }}>
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
