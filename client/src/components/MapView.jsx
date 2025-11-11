// frontend/src/components/MapView.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../contexts/AppContext";

// ✅ Determine backend URL dynamically (context + fallback)
const getSocketUrl = () => {
  // Use Render backend in production
  if (import.meta.env.MODE === "production") {
    return "https://real-time-vehicle-tracking.onrender.com";
  }
  // Use localhost during development
  return "http://localhost:5001";
};

const socket = io(getSocketUrl(), {
  transports: ["websocket", "polling"], // ensures stable connection on Render
});

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
  iconSize: [32, 32],
});

// ✅ Main MapView component

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { url } = useAppContext(); // url provided by your AppContext

  useEffect(() => {
    // ✅ Fetch all vehicles once at mount
    axios
      .get(`${url}/vehicles`)
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error fetching vehicles:", err));

    // ✅ Listen for live location updates
    socket.on("locationUpdate", (data) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === data.vehicleId
            ? { ...v, lat: data.lat, lng: data.lng }
            : v
        )
      );
    });

    return () => {
      socket.off("locationUpdate");
    };
  }, [url]);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((v) => (
        <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={carIcon}>
          <Popup>
            <b>{v.name}</b>
            <br />
            Lat: {v.lat.toFixed(4)}
            <br />
            Lng: {v.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;