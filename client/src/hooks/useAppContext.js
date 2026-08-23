import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

/**
 * Custom hook to access global AppContext values (socket, backend URLs, user list).
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default useAppContext;
