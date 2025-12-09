import React from "react";
import { Home, Users, Map } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            activeTab === "dashboard" ? "bg-gray-700" : "hover:bg-gray-800"
          }`}
        >
          <Home size={20} /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            activeTab === "users" ? "bg-gray-700" : "hover:bg-gray-800"
          }`}
        >
          <Users size={20} /> User Details
        </button>

        <button
          onClick={() => setActiveTab("vehicles")}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            activeTab === "vehicles" ? "bg-gray-700" : "hover:bg-gray-800"
          }`}
        >
          <Map size={20} /> Active Vehicles
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
