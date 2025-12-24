import React from "react";
import { Users, Truck, Navigation, Activity, BarChart3, Clock, Redo, TruckElectric } from "lucide-react";
import StatCard from "./StatCard";

const StatsDashboard = ({ stats, vehicles }) => {
  const statCards = [
    { 
      title: "Total Users", 
      value: stats.totalUsers,
      icon: Truck,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      title: "Vehicles Added", 
      value: stats.totalVehiclesAdded,
      icon: Truck,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    { 
      title: "Tracked Vehicles", 
      value: stats.totalTrackedVehicles,
      icon: Navigation,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      title: "Active Now", 
      value: stats.activeVehicles,
      icon: Activity,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time tracking statistics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>Updates every 10 seconds</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <StatCard key={idx} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Activity Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Vehicle Activity Rate</span>
              <span className="font-semibold text-green-500">
                {stats.totalVehiclesAdded > 0 
                  ? `${((stats.activeVehicles / stats.totalVehiclesAdded) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Avg Vehicles per User</span>
              <span className="font-semibold text-green-500">
                {stats.totalUsers > 0 
                  ? (stats.totalVehiclesAdded / stats.totalUsers).toFixed(1)
                  : "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Live Updates
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Connected Vehicles</span>
              <span className="font-bold text-xl">{stats.activeVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Locations Tracked</span>
              <span className="font-bold text-xl">{vehicles.length}</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((stats.activeVehicles / (stats.totalVehiclesAdded || 1)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;