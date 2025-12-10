import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppContext } from "../contexts/AppContext";
import { Plus, Car, Bike, Truck, Bus, Navigation, Users, Activity, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddVehicleForm from "../components/map/AddVehicleForm";
import VehiclePopup from "../components/map/VehiclePopup";
import { Link } from "react-router-dom";

// Fix: Create custom icons with proper URLs (Vite / ES modules)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("../../node_modules/leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// Custom Vehicle Icons - Using different, better matching icons
const createCustomIcon = (color, iconUrl) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <img 
          src="${iconUrl}" 
          style="width: 24px; height: 24px; filter: brightness(0) invert(1);" 
          alt="vehicle"
        />
      </div>
    `,
    className: "custom-vehicle-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const icons = {
  car: createCustomIcon("#3B82F6", "https://cdn-icons-png.flaticon.com/512/3076/3076042.png"),
  bike: createCustomIcon("#EF4444", "https://cdn-icons-png.flaticon.com/512/2972/2972185.png"),
  truck: createCustomIcon("#F59E0B", "https://cdn-icons-png.flaticon.com/512/1630/1630288.png"),
  bus: createCustomIcon("#10B981", "https://cdn-icons-png.flaticon.com/512/2819/2819107.png"),
};

// Preview marker for new vehicle
const previewIcon = L.divIcon({
  html: `
    <div style="
      background-color: #8B5CF6;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
      animation: pulse 2s infinite;
    ">
      <div style="
        color: white;
        font-size: 24px;
        font-weight: bold;
      ">+</div>
    </div>
  `,
  className: "preview-vehicle-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Stats icons mapping
const statsIcons = {
  car: <Car className="text-blue-500" size={20} />,
  bike: <Bike className="text-red-500" size={20} />,
  truck: <Truck className="text-amber-500" size={20} />,
  bus: <Bus className="text-green-500" size={20} />,
};

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { url, socket } = useAppContext();
  const [open, setOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ 
    name: "", 
    type: "car", 
    lat: null, 
    lng: null 
  });
  const [loading, setLoading] = useState({
    adding: false,
    removing: false,
    removingId: null
  });
  const { user } = useUser();

  // Calculate vehicle stats
  const vehicleStats = {
    total: vehicles.length,
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {}),
    active: vehicles.length,
  };

  // Load vehicles
  useEffect(() => {
    if (!user) return;

    axios.get(`${url}/vehicles/${user.id}`)
      .then(res => setVehicles(res.data))
      .catch(err => {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to load vehicles");
      });

    socket.on("locationUpdate", (data) => {
      if (data.userId !== user.id) return;
      setVehicles(prev => prev.map(v => 
        v.vehicleId === data.vehicleId 
          ? { ...v, lat: data.lat, lng: data.lng } 
          : v
      ));
    });

    return () => socket.off("locationUpdate");
  }, [url, user, socket]);

  // Map click handler
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (open) {
          setNewVehicle(prev => ({ 
            ...prev, 
            lat: e.latlng.lat, 
            lng: e.latlng.lng 
          }));
          toast.info("Location selected! Fill vehicle details and save.");
        }
      }
    });
    return null;
  };

  // Add vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.lat || !newVehicle.lng) {
      toast.warning("Please fill all fields and select a location!");
      return;
    }

    setLoading({ ...loading, adding: true });

    try {
      const res = await axios.post(`${url}/vehicles/add`, {
        ...newVehicle,
        userId: user.id,
        vehicleId: `VH-${Date.now()}`
      });
      setVehicles(prev => [...prev, res.data]);
      setOpen(false);
      setNewVehicle({ name: "", type: "car", lat: null, lng: null });
      toast.success("Vehicle added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add vehicle");
    } finally {
      setLoading({ ...loading, adding: false });
    }
  };

  // Delete vehicle
  const handleStop = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;

    setLoading({ ...loading, removing: true, removingId: vehicleId });

    try {
      await fetch(`${url}/vehicles/${user.id}/${vehicleId}`, { 
        method: "DELETE" 
      });
      setVehicles(prev => prev.filter(v => v.vehicleId !== vehicleId));
      toast.success("Vehicle removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error removing vehicle");
    } finally {
      setLoading({ ...loading, removing: false, removingId: null });
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/home">
            <img src="/favicon.svg" alt="" className="h-14 w-14"/>
          </Link>
          
          <button 
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={() => setOpen(true)}
            disabled={loading.adding}
          >
            {loading.adding ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {loading.adding ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute top-22 left-20 z-[1000] bg-white rounded-md shadow-lg border border-gray-200 p-4 w-64">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-blue-600" size={20} />
          <h2 className="font-semibold text-gray-800">Vehicle Statistics</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-gray-600" size={18} />
              <span className="text-sm text-gray-700">Total Vehicles</span>
            </div>
            <span className="font-bold text-xl text-gray-900">{vehicleStats.total}</span>
          </div>

          <div className="space-y-2">
            {Object.entries(vehicleStats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statsIcons[type]}
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">All vehicles online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-20 w-full h-full">
        <MapContainer 
          center={[28.6139, 77.209]} 
          zoom={12} 
          className="w-full h-full"
          zoomControl={true}
          style={{ background: "#f8fafc" }}
        >
          <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector />

          {vehicles.map(v => (
            <Marker 
              key={v.vehicleId} 
              position={[v.lat, v.lng]} 
              icon={icons[v.type] || icons.car}
            >
              <Popup>
                <VehiclePopup 
                  vehicle={v} 
                  handleStop={handleStop}
                  isLoading={loading.removing && loading.removingId === v.vehicleId}
                />
              </Popup>
            </Marker>
          ))}

          {open && newVehicle.lat && newVehicle.lng && (
            <Marker position={[newVehicle.lat, newVehicle.lng]} icon={previewIcon} />
          )}
        </MapContainer>
      </div>

      {/* Add Vehicle Form */}
      {open && (
        <AddVehicleForm 
          newVehicle={newVehicle} 
          setNewVehicle={setNewVehicle} 
          setOpen={setOpen} 
          handleSubmit={handleSubmit}
          isLoading={loading.adding}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="text-sm font-semibold text-gray-800 mb-3">Vehicle Legend</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">Car</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">Bike</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-gray-700">Truck</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">Bus</span>
          </div>
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Click on map to set vehicle location</span>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-vehicle-icon {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;