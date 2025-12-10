

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import Loader from "../components/map/Loader";
import { Car, Navigation, MapPin, Clock, Battery, Fuel, Gauge, Wrench, ExternalLink } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fix Leaflet default icons (Vite / ES modules)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("../../node_modules/leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// Custom Vehicle Icons
const createCustomIcon = (color, iconUrl) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        position: relative;
      ">
        <img 
          src="${iconUrl}" 
          style="width: 28px; height: 28px; filter: brightness(0) invert(1);" 
          alt="vehicle"
        />
        <div style="
          position: absolute;
          top: -5px;
          right: -5px;
          width: 12px;
          height: 12px;
          background: #10B981;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        "></div>
      </div>
    `,
    className: "custom-vehicle-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

const icons = {
  car: createCustomIcon("#3B82F6", "https://cdn-icons-png.flaticon.com/512/3076/3076042.png"),
  bike: createCustomIcon("#EF4444", "https://cdn-icons-png.flaticon.com/512/2972/2972185.png"),
  truck: createCustomIcon("#F59E0B", "https://cdn-icons-png.flaticon.com/512/1630/1630288.png"),
  bus: createCustomIcon("#10B981", "https://cdn-icons-png.flaticon.com/512/2819/2819107.png"),
};

// Vehicle type icons for display
const vehicleTypeIcons = {
  car: <Car className="text-blue-500" size={20} />,
  bike: <Car className="text-red-500" size={20} />,
  truck: <Car className="text-amber-500" size={20} />,
  bus: <Car className="text-green-500" size={20} />,
};

const Lander = () => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { url, socket, frontendUrl } = useAppContext();

  // Generate vehicle metrics
  const vehicleMetrics = vehicle ? {
    speed: Math.floor(Math.random() * 60) + 20,
    fuel: Math.floor(Math.random() * 50) + 50,
    battery: Math.floor(Math.random() * 40) + 60,
    health: ["Excellent", "Good", "Moderate"][Math.floor(Math.random() * 3)],
    distance: Math.floor(Math.random() * 50) + 10,
  } : null;

  // Fetch vehicle data initially
  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/vehicles/track/${vehicleId}`);
        if (res.data.success) {
          setVehicle(res.data.vehicle);
          setCoords({
            lat: res.data.vehicle.lat,
            lng: res.data.vehicle.lng,
          });
          setLastUpdate(new Date(res.data.vehicle.updatedAt || Date.now()));
          toast.success(`Tracking ${res.data.vehicle.name} live!`);
        } else {
          toast.error("Vehicle not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load vehicle data");
      } finally {
        setLoading(false);
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
        setVehicle((prev) => ({ 
          ...prev, 
          lat: data.lat, 
          lng: data.lng 
        }));
        setLastUpdate(new Date());
        
        // Show toast notification for location update
        toast.info(`Location updated: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`, {
          autoClose: 2000,
        });
      }
    };

    socket.on("locationUpdate", handleLocationUpdate);

    return () => {
      socket.off("locationUpdate", handleLocationUpdate);
    };
  }, [vehicleId, socket]);

  // Open Google Maps directions
  const openDirections = () => {
    if (!coords) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, "_blank");
  };

  // Share tracking link
  const shareTrackingLink = () => {
    const trackingLink = `${frontendUrl}/track/${vehicleId}`;
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard!");
  };

  if (loading) return <Loader />;
  if (!coords || !vehicle) return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Vehicle Not Found</h2>
        <p className="text-gray-500">The requested vehicle could not be located.</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Toast Notifications */}
      <ToastContainer className='mt-18'
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
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to='/home'>
            <img src="/favicon.svg" className="h-14 w-14" alt="" />
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Tracking</span>
            </div>
            <button
              onClick={openDirections}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded-lg font-medium transition-colors"
            >
              <Navigation size={18} />
              Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Info Panel */}
      <div className="absolute top-22 left-14 z-[1000] bg-white rounded-xl shadow-xl border border-gray-200 p-5 w-80">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {vehicleTypeIcons[vehicle.type] || vehicleTypeIcons.car}
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">{vehicle.name}</h2>
            <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="text-gray-600" size={16} />
              <span className="text-xs text-gray-500">Speed</span>
            </div>
            <p className="font-bold text-gray-900">{vehicleMetrics.speed} <span className="text-xs font-normal text-gray-500">km/h</span></p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Fuel className="text-gray-600" size={16} />
              <span className="text-xs text-gray-500">Fuel</span>
            </div>
            <p className="font-bold text-gray-900">{vehicleMetrics.fuel}<span className="text-xs font-normal text-gray-500">%</span></p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="text-gray-600" size={16} />
              <span className="text-xs text-gray-500">Battery</span>
            </div>
            <p className="font-bold text-gray-900">{vehicleMetrics.battery}<span className="text-xs font-normal text-gray-500">%</span></p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="text-gray-600" size={16} />
              <span className="text-xs text-gray-500">Health</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              vehicleMetrics.health === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
              vehicleMetrics.health === 'Good' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {vehicleMetrics.health}
            </span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-800">Current Location</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latitude</span>
              <span className="font-mono font-medium">{coords.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Longitude</span>
              <span className="font-mono font-medium">{coords.lng.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Last Updated & Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} />
              Last Updated
            </div>
            <span className="font-medium text-gray-900">
              {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareTrackingLink}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Share Link
            </button>
            <button
              onClick={openDirections}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Navigate
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full pt-20">
        <MapContainer 
          center={[coords.lat, coords.lng]} 
          zoom={15} 
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[coords.lat, coords.lng]} icon={icons[vehicle.type] || icons.car}>
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
                <div className="text-sm space-y-1">
                  <p>📍 <span className="font-medium">Location:</span> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                  <p>⚡ <span className="font-medium">Speed:</span> {vehicleMetrics.speed} km/h</p>
                  <p>⏱️ <span className="font-medium">Updated:</span> {lastUpdate.toLocaleTimeString()}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="text-sm font-semibold text-gray-800 mb-2">Live Tracking Active</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">Real-time updates enabled</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Location updates automatically
        </div>
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
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Lander;