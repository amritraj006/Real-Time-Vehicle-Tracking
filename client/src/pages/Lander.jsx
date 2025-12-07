import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import Loader from "../components/map/Loader";

// Icons for vehicles
const icons = {
  car: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png", iconSize: [32, 32] }),
  bike: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", iconSize: [32, 32] }),
  truck: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/7430/7430280.png", iconSize: [36, 36] }),
  bus: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/296/296216.png", iconSize: [36, 36] }),
};

const Lander = () => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [coords, setCoords] = useState(null);
  const { url, socket } = useAppContext();

  // Fetch vehicle data initially
  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${url}/vehicles/track/${vehicleId}`);
        if (res.data.success) {
          setVehicle(res.data.vehicle);
          setCoords({
            lat: res.data.vehicle.lat,
            lng: res.data.vehicle.lng,
          });
        } else {
          console.log("Vehicle not found");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [vehicleId, url]);

  // Listen for real-time location updates via Socket.io
  useEffect(() => {
    if (!vehicleId) return;

    const handleLocationUpdate = (data) => {
      if (data.vehicleId === vehicleId) {
        setCoords({ lat: data.lat, lng: data.lng });
        setVehicle((prev) => ({ ...prev, lat: data.lat, lng: data.lng, updatedAt: new Date() }));
      }
    };

    socket.on("locationUpdate", handleLocationUpdate);

    return () => {
      socket.off("locationUpdate", handleLocationUpdate);
    };
  }, [vehicleId, socket]);

  if (!coords) return <Loader />;

  return (
    <div className="w-full h-screen">
      <MapContainer center={[coords.lat, coords.lng]} zoom={13} className="w-full h-full">
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicle && (
          <Marker position={[coords.lat, coords.lng]} icon={icons[vehicle.type] || icons.car}>
            <Popup>
              <h2 className="font-bold">{vehicle.name}</h2>
              <p>Type: {vehicle.type}</p>
              <p>Latitude: {coords.lat.toFixed(6)}</p>
              <p>Longitude: {coords.lng.toFixed(6)}</p>
              <p>Last Updated: {new Date(vehicle.updatedAt).toLocaleString()}</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Lander;
