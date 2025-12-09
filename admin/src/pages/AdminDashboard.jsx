// Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Users, Truck, Activity } from "lucide-react"; // icons
import "leaflet/dist/leaflet.css";

// ------------------ LEAFLET ICON FIX ------------------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BACKEND_ORIGIN = "http://localhost:5001";
const SOCKET_URL = BACKEND_ORIGIN;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehiclesAdded: 0,
    totalTrackedVehicles: 0,
    activeVehicles: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("stats"); // stats, users, vehicles

  const socketRef = useRef(null);

  // ------------------ Data fetching ------------------
  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${BACKEND_ORIGIN}/api/dashboard/stats`),
        axios.get(`${BACKEND_ORIGIN}/api/users`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  const fetchActiveVehicles = async () => {
    try {
      const res = await axios.get(`${BACKEND_ORIGIN}/api/vehicles/active`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data && Array.isArray(res.data.vehicles)
        ? res.data.vehicles
        : [];
      setVehicles(list);
      setMapLoading(false);
    } catch (err) {
      console.error("Error fetching active vehicles:", err);
      setMapLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchActiveVehicles();

    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, []);

  // ------------------ Socket.io ------------------
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", (reason) =>
      console.warn("Socket disconnected:", reason)
    );

    socket.on("locationUpdate", (payload) => {
      const incoming = {
        vehicleId: payload.vehicleId ?? payload._id ?? payload.id,
        name: payload.name ?? payload.vehicleName ?? "Unknown",
        type: payload.type ?? "unknown",
        lat: Number(payload.lat),
        lng: Number(payload.lng),
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        userId: payload.userId ?? null,
        ...payload,
      };

      setVehicles((prev) => {
        const idx = prev.findIndex(
          (v) =>
            (v.vehicleId && incoming.vehicleId && v.vehicleId === incoming.vehicleId) ||
            (v._id && incoming._id && v._id === incoming._id)
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
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  if (loading)
    return <div className="text-center mt-20 text-gray-700">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>
    );

  // ------------------ Main Content Components ------------------
  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: "Total Users", value: stats.totalUsers },
        { title: "Total Vehicles Added", value: stats.totalVehiclesAdded },
        { title: "Total Tracked Vehicles", value: stats.totalTrackedVehicles },
        { title: "Active Vehicles (last 10s)", value: stats.activeVehicles },
      ].map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-center items-start"
        >
          <h3 className="text-lg font-medium text-gray-600">{card.title}</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  );

  const renderUsers = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <img
            src={user.image}
            alt={user.name}
            className="w-20 h-20 rounded-full mb-4 object-cover"
          />
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-3">
            <h4 className="font-semibold text-gray-700">Vehicles:</h4>
            {user.vehicles?.length > 0 ? (
              <ul className="list-disc list-inside text-gray-600">
                {user.vehicles.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No vehicles</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMap = () => (
    <div className="w-full h-[550px] rounded-lg overflow-hidden shadow-md border">
      {mapLoading ? (
        <div className="flex items-center justify-center h-full text-gray-600">
          Loading map...
        </div>
      ) : (
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {vehicles.map((v) => {
            const lat = Number(v.lat);
            const lng = Number(v.lng);
            if (!isFinite(lat) || !isFinite(lng)) return null;
            const key = v.vehicleId ?? v._id ?? `${lat}-${lng}-${v.name}`;
            return (
              <Marker key={key} position={[lat, lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{v.name}</p>
                    {v.type && <p>Type: {v.type}</p>}
                    <p>Lat: {lat.toFixed(4)}</p>
                    <p>Lng: {lng.toFixed(4)}</p>
                    <p>
                      Updated:{" "}
                      {v.updatedAt
                        ? new Date(v.updatedAt).toLocaleString()
                        : "—"}
                    </p>
                    {v.userId && <p>User: {v.userId}</p>}
                    <p className="text-gray-400 text-xs">
                      ID: {v.vehicleId ?? v._id}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4 text-gray-700">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-200 transition ${
              activeTab === "stats" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <Activity size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-200 transition ${
              activeTab === "users" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <Users size={18} /> Users
          </button>
          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-200 transition ${
              activeTab === "vehicles" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            <Truck size={18} /> Vehicles
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "stats" && renderStats()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "vehicles" && renderMap()}
      </main>
    </div>
  );
};

export default Dashboard;
