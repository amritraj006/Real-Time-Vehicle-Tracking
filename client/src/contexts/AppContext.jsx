import React, { createContext, useContext} from "react";

// 1️⃣ Create the context
const AppContext = createContext();

// 2️⃣ Create the provider component
export const AppProvider = ({ children }) => {
  const url = "https://real-time-vehicle-tracking.onrender.com";

  return (
    <AppContext.Provider value={{ url }}>
      {children}
    </AppContext.Provider>
  );
};

// 3️⃣ Create a custom hook for consuming the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
