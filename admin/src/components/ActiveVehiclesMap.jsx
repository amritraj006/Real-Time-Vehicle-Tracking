import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

const ActiveVehiclesMap = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    socket.on("vehicle-location-update", (data) => {
      setVehicles(data);
    });

    return () => socket.off("vehicle-location-update");
  }, []);

  const icon = L.icon({
    iconUrl: "/vehicle.png",
    iconSize: [38, 38],
  });

  return (
    <div className="p-6 h-screen">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full rounded-lg shadow-md">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {vehicles.map((v) => (
          <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={icon}>
            <Popup>
              <p className="font-bold">{v.vehicleName}</p>
              <p>Speed: {v.speed} km/h</p>
              <p>Last Update: {v.time}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ActiveVehiclesMap;
