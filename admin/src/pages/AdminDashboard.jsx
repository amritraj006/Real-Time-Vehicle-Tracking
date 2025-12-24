import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../contexts/AppContext";
import Sidebar from "../components/Sidebar";
import StatsDashboard from "../components/StatsDashboard";
import UsersDashboard from "../components/UsersDashboard";
import MapDashboard from "../components/MapDashboard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

const AdminDashboard = () => {
  const { url, socket } = useAppContext();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehiclesAdded: 0,
    totalTrackedVehicles: 0,
    activeVehicles: 0,
  });
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("stats");
  

  // ------------------ Fetch Dashboard Data ------------------
  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${url}/dashboard/stats`),
        axios.get(`${url}/users`),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  // ------------------ Fetch Initial Vehicles ------------------
  const fetchActiveVehicles = async () => {
    try {
      const res = await axios.get(`${url}/vehicles/active`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.vehicles)
        ? res.data.vehicles
        : [];
      setVehicles(list);
      setMapLoading(false);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setMapLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchActiveVehicles();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // ------------------ SOCKET.IO REAL-TIME LOCATION UPDATES ------------------
  useEffect(() => {
    if (!socket) return;

    socket.on("locationUpdate", (payload) => {
      const incoming = {
        vehicleId: payload.vehicleId ?? payload._id ?? payload.id,
        name: payload.name ?? payload.vehicleName ?? "Unknown",
        type: payload.type ?? "unknown",
        lat: Number(payload.lat),
        lng: Number(payload.lng),
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        userId: payload.userId ?? null,
      };

      setVehicles((prev) => {
        const idx = prev.findIndex(
          (v) =>
            v.vehicleId === incoming.vehicleId ||
            v._id === incoming.vehicleId
        );

        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...incoming };
          return copy;
        }

        return [...prev, incoming];
      });
    });

    socket.on("locationBulk", (bulk) => {
      if (Array.isArray(bulk)) setVehicles(bulk);
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("locationBulk");
    };
  }, [socket]);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "stats":
        return <StatsDashboard stats={stats} vehicles={vehicles} />;
      case "users":
        return <UsersDashboard users={users} />;
      case "vehicles":
        return <MapDashboard vehicles={vehicles} mapLoading={mapLoading} />;
      default:
        return <StatsDashboard stats={stats} vehicles={vehicles} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col lg:flex-row">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          socket={socket} 
        />
        
        <main className="flex-1 p-6 lg:p-8">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;