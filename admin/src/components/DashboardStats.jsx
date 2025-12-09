import React from "react";

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md w-full">
    <h3 className="text-gray-600 text-lg">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Total Vehicles Added" value={stats.totalVehicles} />
      <StatCard title="Active Vehicles" value={stats.activeVehicles} />
      <StatCard title="Inactive Vehicles" value={stats.totalVehicles - stats.activeVehicles} />
    </div>
  );
};

export default DashboardStats;
