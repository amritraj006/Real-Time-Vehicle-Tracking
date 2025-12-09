// Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
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

const BACKEND_ORIGIN = "http://localhost:5001"; // change if your backend runs elsewhere
const SOCKET_URL = BACKEND_ORIGIN;

const Dashboard = () => {
  // Stats & Users (existing)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehiclesAdded: 0,
    totalTrackedVehicles: 0,
    activeVehicles: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Map & vehicles
  const [vehicles, setVehicles] = useState([]); // array of { vehicleId, name, type, lat, lng, updatedAt, ... }
  const [mapLoading, setMapLoading] = useState(true);

  // Keep socket in ref so we don't recreate on each render
  const socketRef = useRef(null);

  // Fetch stats + users (existing behavior)
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

  // Fetch active vehicles initial load
  const fetchActiveVehicles = async () => {
    try {
      const res = await axios.get(`${BACKEND_ORIGIN}/api/vehicles/active`);
      // Accept both formats: { vehicles: [...] } or plain array
      const list = Array.isArray(res.data)
        ? res.data
        : res.data && Array.isArray(res.data.vehicles)
        ? res.data.vehicles
        : [];
      console.log("Initial active vehicles:", list);
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

    // Polling stats+users every 10s (keeps stats/users updated)
    const interval = setInterval(() => {
      fetchData();
      // optionally fetchActiveVehicles(); // Not required when using socket for live updates
    }, 10000);

    return () => clearInterval(interval);
  }, []); // run once

  useEffect(() => {
    // Initialize socket once
    if (socketRef.current) return; // already connected

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err?.message || err);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    // This must match the event name your backend emits (we used "vehicleUpdate")
    socket.on("locationUpdate", (payload) => {
      // payload can be either the full vehicle document or a smaller object — merge safely
      console.log("locationUpdate received:", payload);

      // normalize incoming object (some backends send _id, some vehicleId)
      const incoming = {
        vehicleId: payload.vehicleId ?? payload.vehicleId ?? payload._id ?? payload.id,
        name: payload.name ?? payload.vehicleName ?? payload?.name ?? "Unknown",
        type: payload.type ?? "unknown",
        lat: Number(payload.lat),
        lng: Number(payload.lng),
        updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
        userId: payload.userId ?? null,
        // keep other fields if present
        ...payload,
      };

      setVehicles((prev) => {
        // if prev contains objects keyed by _id or vehicleId, try to match both
        const idx = prev.findIndex(
          (v) =>
            (v.vehicleId && incoming.vehicleId && v.vehicleId === incoming.vehicleId) ||
            (v._id && incoming._id && v._id === incoming._id)
        );

        if (idx !== -1) {
          // update existing
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...incoming };
          return copy;
        }

        // add new
        return [...prev, incoming];
      });
    });

    // Optional: listen for a bulk update event from backend if provided
    socket.on("locationBulk", (bulk) => {
      console.log("locationBulk received:", bulk);
      if (Array.isArray(bulk)) {
        setVehicles(bulk);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Total Vehicles Added</h2>
          <p className="text-3xl mt-2">{stats.totalVehiclesAdded}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Total Tracked Vehicles</h2>
          <p className="text-3xl mt-2">{stats.totalTrackedVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Active Vehicles (last 10s)</h2>
          <p className="text-3xl mt-2">{stats.activeVehicles}</p>
        </div>
      </div>

      {/* Users List */}
      <h2 className="text-xl font-bold mb-4">All Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {users.map((user) => (
          <div key={user._id} className="bg-white p-6 rounded-lg shadow-md">
            <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full mb-4" />
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2">
              <h4 className="font-semibold">Vehicles:</h4>
              {user.vehicles?.length > 0 ? (
                <ul className="list-disc list-inside">
                  {user.vehicles.map((vehicle, idx) => (
                    <li key={idx}>{vehicle}</li>
                  ))}
                </ul>
              ) : (
                <p>No vehicles</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- MAP (Option A) ---------------- */}
      <h2 className="text-xl font-bold mb-4">Active Vehicles (Live Map)</h2>

      <div className="w-full h-[550px] rounded-lg overflow-hidden shadow-md border">
        {mapLoading ? (
          <div className="flex items-center justify-center h-full">Loading map...</div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {vehicles.length === 0 ? null : vehicles.map((v) => {
              // defensive checks: skip if lat/lng invalid
              const lat = Number(v.lat);
              const lng = Number(v.lng);
              if (!isFinite(lat) || !isFinite(lng)) return null;

              // choose an id for React key
              const key = v.vehicleId ?? v._id ?? `${lat}-${lng}-${v.name}`;

              return (
                <Marker key={key} position={[lat, lng]}>
                  <Popup>
                    <div>
                      <p><strong>{v.name ?? v.vehicleName ?? "Unnamed"}</strong></p>
                      {v.type && <p>Type: {v.type}</p>}
                      <p>Lat: {lat}</p>
                      <p>Lng: {lng}</p>
                      <p>Updated: {v.updatedAt ? new Date(v.updatedAt).toLocaleString() : "—"}</p>
                      {v.userId && <p>User: {v.userId}</p>}
                      <p style={{ fontSize: 12, color: "#666" }}>id: {v.vehicleId ?? v._id}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
