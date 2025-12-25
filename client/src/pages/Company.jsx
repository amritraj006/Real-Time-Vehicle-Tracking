import React from "react";
import {
  Car,
  Truck,
  Bike,
  Activity,
  MapPin,
  AlertTriangle,
  Server,
} from "lucide-react";

const Company = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          🚗 TrackFleet Technologies
        </h1>
        <p className="text-gray-600 mt-1">
          Real-Time Fleet & Vehicle Monitoring Dashboard
        </p>
        <div className="mt-3 text-sm text-gray-500">
          Headquarters: Bangalore, India
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={<Car />} title="Total Vehicles" value="120" />
        <StatCard icon={<Activity />} title="Active Vehicles" value="87" />
        <StatCard icon={<MapPin />} title="Live Trips" value="42" />
        <StatCard icon={<AlertTriangle />} title="Alerts" value="5" />
        <StatCard icon={<Truck />} title="Trucks" value="40" />
        <StatCard icon={<Bike />} title="Bikes" value="30" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Distribution */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">
            🚘 Vehicle Distribution
          </h2>

          <Progress label="Cars" percent={45} />
          <Progress label="Trucks" percent={30} />
          <Progress label="Bikes" percent={15} />
          <Progress label="Buses" percent={10} />
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            📜 Live Activity Feed
          </h2>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              🚗 <span>DL-01-AB-1234 started a new trip</span>
            </li>
            <li className="flex items-center gap-2 text-yellow-600">
              ⚠️ <span>MH-12-XY-8899 exceeded speed limit</span>
            </li>
            <li className="flex items-center gap-2">
              📍 <span>KA-09-ZZ-4567 reached destination</span>
            </li>
            <li className="flex items-center gap-2">
              🚚 <span>RJ-14-TR-3321 is idle</span>
            </li>
          </ul>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-lg font-semibold mb-4">
          🟢 System Status
        </h2>

        <div className="flex flex-wrap gap-6 text-sm">
          <Status label="Socket Connection" value="Connected" />
          <Status label="API Server" value="Online" />
          <Status label="Tracking Engine" value="Running" />
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
    <div className="text-blue-600">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const Progress = ({ label, percent }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);

const Status = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <Server className="text-green-600" size={18} />
    <span className="text-gray-700">
      {label}: <b>{value}</b>
    </span>
  </div>
);

export default Company;
