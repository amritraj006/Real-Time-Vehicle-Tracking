// frontend/src/components/MapView.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const socket = io("https://real-time-vehicle-tracking.onrender.com"); // ✅ Correct backend URL

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
  iconSize: [32, 32],
});

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Fetch all vehicles
    axios.get("api/vehicles").then((res) => setVehicles(res.data));

    // Listen for live updates
    socket.on("locationUpdate", (data) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === data.vehicleId ? { ...v, lat: data.lat, lng: data.lng } : v
        )
      );
    });

    return () => socket.off("locationUpdate");
  }, []);

  return (
    <MapContainer center={[28.6139, 77.2090]} zoom={10} style={{ height: "90vh", width: "100%" }}>
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
