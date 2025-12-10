import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../contexts/AppContext";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Tooltip } from "react-leaflet";


import AddVehicleForm from "../components/map/AddVehicleForm";
import VehiclePopup from "../components/map/VehiclePopup";

// Icons
const icons = {
  car: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png", iconSize: [32, 32] }),
  bike: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", iconSize: [32, 32] }),
  truck: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/7430/7430280.png", iconSize: [36, 36] }),
  bus: new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/296/296216.png", iconSize: [36, 36] }),
};

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { url, socket } = useAppContext(); // ⚡ Use context
  const [open, setOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: "", type: "car", lat: null, lng: null });
  const { user } = useUser();

  // Load vehicles
  useEffect(() => {
    if (!user) return;

    axios.get(`${url}/vehicles/${user.id}`)
      .then(res => setVehicles(res.data))
      .catch(err => console.error("Error fetching vehicles:", err));

    socket.on("locationUpdate", (data) => {
      if (data.userId !== user.id) return;
      setVehicles(prev => prev.map(v => v.vehicleId === data.vehicleId ? { ...v, lat: data.lat, lng: data.lng } : v));
    });

    return () => socket.off("locationUpdate");
  }, [url, user, socket]);

  // Map click to set vehicle
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (open) {
          setNewVehicle(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        }
      }
    });
    return null;
  };

  // Add vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.lat || !newVehicle.lng) return alert("Fill all fields and select location!");

    try {
      const res = await axios.post(`${url}/vehicles/add`, {
        ...newVehicle,
        userId: user.id,
        vehicleId: `VH-${Date.now()}`
      });
      setVehicles(prev => [...prev, res.data]);
      setOpen(false);
      setNewVehicle({ name: "", type: "car", lat: null, lng: null });
    } catch (err) {
      console.error(err);
      alert("Failed to add vehicle");
    }
  };

  // Stop/Delete vehicle
  const handleStop = async (vehicleId) => {
    if (!user) return alert("Please login first");

    try {
      const res = await fetch(`${url}/vehicles/${user.id}/${vehicleId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) setVehicles(prev => prev.filter(v => v.vehicleId !== vehicleId));
      else alert(data.message || "Error stopping vehicle");
    } catch (err) {
      console.error(err);
      alert("Error deleting vehicle");
    }
  };
  

  return (
    <div className="relative w-full h-screen">
      <button className="absolute flex items-center gap-2 top-4 right-4 z-[1000] bg-green-500 hover:bg-green-600 transition px-4 py-2 text-white rounded shadow-lg"
        onClick={() => setOpen(true)}>
        Add Vehicle <Plus size={18} />
      </button>

      <MapContainer center={[28.6139, 77.209]} zoom={10} className="w-full h-full">
        <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector />

        {vehicles.map(v => (
  <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={icons[v.type] || icons.car}>
    
    {/* Show vehicle name ALWAYS visible */}
    <Tooltip permanent direction="top" offset={[0, -20]}>
      <span className="font-semibold text-blue-600">{v.name}</span>
    </Tooltip>

    <Popup>
      <VehiclePopup vehicle={v} handleStop={handleStop} />
    </Popup>
  </Marker>
))}


        {open && newVehicle.lat && newVehicle.lng && <Marker position={[newVehicle.lat, newVehicle.lng]} icon={icons[newVehicle.type]} />}
      </MapContainer>

      {open && <AddVehicleForm newVehicle={newVehicle} setNewVehicle={setNewVehicle} setOpen={setOpen} handleSubmit={handleSubmit} />}
    </div>
  );
};

export default MapView;
