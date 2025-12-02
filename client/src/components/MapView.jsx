import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { io } from "socket.io-client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../contexts/AppContext";
import { Plus, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

// ✅ Backend URL
const getSocketUrl = () => {
  return import.meta.env.MODE === "production"
    ? "https://real-time-vehicle-tracking.onrender.com"
    : "http://localhost:5001";
};

const socket = io(getSocketUrl(), { transports: ["websocket", "polling"] });

// ✅ Icons for each vehicle type
const icons = {
  car: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
    iconSize: [32, 32],
  }),
  bike: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    iconSize: [32, 32],
  }),
  truck: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/7430/7430280.png",
    iconSize: [36, 36],
  }),
  bus: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/296/296216.png",
    iconSize: [36, 36],
  }),
};

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { url } = useAppContext();
  const [open, setOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "car",
    lat: null,
    lng: null,
  });
  const { user } = useUser();

  // ✅ Fetch user-specific vehicles
  useEffect(() => {
  if (!user) return;

  axios
    .get(`${url}/vehicles/${user.id}`)
    .then((res) => setVehicles(res.data))
    .catch((err) => console.error("Error fetching vehicles:", err));

  socket.on("locationUpdate", (data) => {
    if (data.userId !== user.id) return; // Only update current user's vehicles
    setVehicles((prev) =>
      prev.map((v) =>
        v.vehicleId === data.vehicleId ? { ...v, lat: data.lat, lng: data.lng } : v
      )
    );
  });

  return () => socket.off("locationUpdate");
}, [url, user]);


  // ✅ Map click event to set vehicle location
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (open) {
          setNewVehicle((prev) => ({
            ...prev,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          }));
        }
      },
    });
    return null;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.lat || !newVehicle.lng) {
      alert("Please fill all fields and click on the map to set location!");
      return;
    }

    try {
      const res = await axios.post(`${url}/vehicles/add`, {
        ...newVehicle,
        userId: user.id,
        vehicleId: `VH-${Date.now()}`,
      });

      setVehicles((prev) => [...prev, res.data]);
      setOpen(false);
      setNewVehicle({ name: "", type: "car", lat: null, lng: null });
    } catch (err) {
      console.error("Error adding vehicle:", err);
      alert("Failed to add vehicle");
    }
  };

  const handleStop = async (vehicleId) => {
  if (!user) return alert("Please login first");

  try {
    const response = await fetch(`${url}/vehicles/${user.id}/${vehicleId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (response.ok) {
      alert("Vehicle stopped and removed successfully!");
      // Optionally, remove it from local state to update UI
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleId));
    } else {
      alert(data.message || "Error stopping vehicle");
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    alert("Error deleting vehicle");
  }
};

  return (
    <div className="relative w-full h-screen">
      {/* ✅ Add Vehicle Button */}
      <button
        className="absolute flex items-center gap-2 top-4 right-4 z-[1000] bg-green-500 hover:bg-green-600 transition px-4 py-2 text-white rounded shadow-lg"
        onClick={() => setOpen(true)}
      >
        Add Vehicle <Plus size={18} />
      </button>

      {/* ✅ Map */}
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={10}
        className="w-full h-full"
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector />

        {/* ✅ Existing vehicles */}
        {vehicles.map((v) => (
          <Marker
            key={v.vehicleId}
            position={[v.lat, v.lng]}
            icon={icons[v.type] || icons.car}
          >
            <Popup>
              <b>{v.name}</b>
              <br />
              Type: {v.type}
              <br />
              Lat: {v.lat.toFixed(4)}
              <br />
              Lng: {v.lng.toFixed(4)}
              <br />
               <button onClick={() => handleStop(v.vehicleId)}>Stop</button>
            </Popup>
          </Marker>
        ))}

        {/* ✅ New Vehicle Marker (while selecting) */}
        {newVehicle.lat && newVehicle.lng && open && (
          <Marker
            position={[newVehicle.lat, newVehicle.lng]}
            icon={icons[newVehicle.type] || icons.car}
          >
            <Popup>New Vehicle Location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ✅ Sidebar Form (click-through fix) */}
      {open && (
        <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-2xl z-[1200] flex flex-col pointer-events-none">
          <div className="p-6 flex-1 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Your Vehicle</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Vehicle Name"
                value={newVehicle.name}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, name: e.target.value })
                }
                className="border p-2 rounded"
              />

              <select
                value={newVehicle.type}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, type: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
              </select>

              <div className="text-sm text-gray-600">
                Click on the map to set location:
                <br />
                <span className="font-medium text-black">
                  {newVehicle.lat && newVehicle.lng
                    ? `Lat: ${newVehicle.lat.toFixed(
                        4
                      )}, Lng: ${newVehicle.lng.toFixed(4)}`
                    : "No location selected"}
                </span>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
