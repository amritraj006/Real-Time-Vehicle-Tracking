// frontend/src/components/MapView.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Backend URL
const BACKEND_URL = "https://real-time-vehicle-tracking-1.onrender.com";

// ✅ Connect to Socket.io
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
  iconSize: [32, 32],
});

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // ✅ Fetch initial vehicles
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/vehicles`);
        setVehicles(res.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();

    // ✅ Listen for real-time updates
    socket.on("locationUpdate", (data) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === data.vehicleId
            ? { ...v, lat: data.lat, lng: data.lng }
            : v
        )
      );
    });

    // ✅ Cleanup listener on unmount
    return () => {
      socket.off("locationUpdate");
    };
  }, []);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={10}
      style={{ height: "90vh", width: "100%" }}
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
            Lat: {v.lat.toFixed(4)} <br />
            Lng: {v.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
