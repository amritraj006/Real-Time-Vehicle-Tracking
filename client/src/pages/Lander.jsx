import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import Loader from "../components/map/Loader";
import { 
  Car, Navigation, MapPin, Clock, Battery, Fuel, Gauge, 
  Wrench, ExternalLink, Share2, Radar, Activity, Satellite,
  Signal, Shield, Zap, Maximize2, Minimize2, RefreshCw
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fix Leaflet default icons (Vite / ES modules)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("../../node_modules/leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// Enhanced vehicle type configurations with gradients
const vehicleTypeConfig = {
  car: {
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    light: "rgba(59, 130, 246, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3076/3076042.png",
    name: "Car"
  },
  bike: {
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    light: "rgba(239, 68, 68, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    name: "Bike"
  },
  truck: {
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    light: "rgba(245, 158, 11, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1630/1630288.png",
    name: "Truck"
  },
  bus: {
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    light: "rgba(16, 185, 129, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2819/2819107.png",
    name: "Bus"
  },
};

// Enhanced Vehicle Icon with multiple effects
const createEnhancedIcon = (type) => {
  const config = vehicleTypeConfig[type] || vehicleTypeConfig.car;
  
  return L.divIcon({
    html: `
      <div class="enhanced-marker-container">
        <div class="marker-outer-ring" style="background: ${config.color}"></div>
        <div class="marker-middle-ring" style="background: ${config.color}"></div>
        <div class="marker-inner-glow" style="background: ${config.gradient}"></div>
        <div class="marker-main" style="background: ${config.gradient}">
          <img src="${config.iconUrl}" alt="${config.name}"/>
        </div>
        <div class="live-indicator">
          <div class="pulse-dot"></div>
        </div>
      </div>
    `,
    className: "enhanced-vehicle-icon",
    iconSize: [65, 65],
    iconAnchor: [32.5, 65],
    popupAnchor: [0, -65],
  });
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  const { url, socket, frontendUrl } = useAppContext();
  const mapRef = useRef();
  const updateCountRef = useRef(0);

  // Generate enhanced vehicle metrics
  const [vehicleMetrics, setVehicleMetrics] = useState({
    speed: Math.floor(Math.random() * 60) + 20,
    fuel: Math.floor(Math.random() * 50) + 50,
    battery: Math.floor(Math.random() * 40) + 60,
    health: "Excellent",
    distance: Math.floor(Math.random() * 50) + 10,
    accuracy: 95 + Math.random() * 5,
    signal: "Strong",
    altitude: Math.floor(Math.random() * 100) + 50,
  });

  // Fetch vehicle data initially
  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/vehicles/track/${vehicleId}`);
        if (res.data.success) {
          const vehicleData = res.data.vehicle;
          setVehicle(vehicleData);
          const initialCoords = {
            lat: vehicleData.lat,
            lng: vehicleData.lng,
          };
          setCoords(initialCoords);
          setRouteHistory([initialCoords]);
          setLastUpdate(new Date(vehicleData.updatedAt || Date.now()));
          
          toast.success(`🚗 Tracking ${vehicleData.name} live!`, {
            icon: "🎯",
          });
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
        updateCountRef.current += 1;
        const newCoords = { lat: data.lat, lng: data.lng };
        setCoords(newCoords);
        
        // Add to route history
        setRouteHistory(prev => {
          const newRoute = [...prev, newCoords];
          return newRoute.slice(-50); // Keep last 50 points
        });

        setVehicle((prev) => ({ 
          ...prev, 
          lat: data.lat, 
          lng: data.lng 
        }));
        
        // Update metrics dynamically
        setVehicleMetrics(prev => ({
          ...prev,
          speed: Math.max(0, prev.speed + (Math.random() * 4 - 2)),
          fuel: Math.max(0, prev.fuel - 0.1),
          battery: Math.max(0, prev.battery - 0.05),
        }));
        
        setLastUpdate(new Date());
        
        // Show subtle notification for updates
        if (updateCountRef.current > 1) {
          toast.info(`📍 Location updated`, {
            autoClose: 1500,
            hideProgressBar: true,
          });
        }
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
  const shareTrackingLink = async () => {
    const trackingLink = `${frontendUrl}/track/${vehicleId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track ${vehicle?.name} Live`,
          text: `Track ${vehicle?.name} in real-time`,
          url: trackingLink,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(trackingLink);
        toast.success("📋 Tracking link copied!");
      }
    } else {
      await navigator.clipboard.writeText(trackingLink);
      toast.success("📋 Tracking link copied!");
    }
  };

  // Toggle fullscreen map
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  };

  // Refresh vehicle data
  const refreshData = async () => {
    try {
      const res = await axios.get(`${url}/vehicles/track/${vehicleId}`);
      if (res.data.success) {
        setVehicle(res.data.vehicle);
        toast.success("Data refreshed!");
      }
    } catch (err) {
      toast.error("Refresh failed");
    }
  };

  if (loading) return <Loader />;
  if (!coords || !vehicle) return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/30">
        <div className="relative mb-6">
          <Car className="w-20 h-20 text-gray-400 mx-auto mb-2" />
          <div className="absolute -inset-4 bg-gray-200/30 blur-xl rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
        <p className="text-gray-600 mb-6">The requested vehicle could not be located.</p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 bg-green-600 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        >
          <Navigation size={18} />
          Return to Home
        </Link>
      </div>
    </div>
  );

  const config = vehicleTypeConfig[vehicle.type] || vehicleTypeConfig.car;

  return (
    <div className={`relative w-full h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 ${isFullscreen ? 'pt-0' : 'pt-20'}`}>
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
        className="mt-16"
      />

      {/* Enhanced Header */}
      <div className={`absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 transition-all duration-300 ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to='/home' className="group">
              <div className="relative">
                <img src="/favicon.svg" className="h-14 w-14 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" alt="Logo" />
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
            
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                Live Tracking • {vehicle.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Updates Active</span>
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  ID: {vehicleId?.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:rotate-180"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-700" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} className="text-gray-700" /> : <Maximize2 size={18} className="text-gray-700" />}
            </button>
            <button
              onClick={openDirections}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-5 py-2.5 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              <Navigation size={18} />
              Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Vehicle Info Panel */}
      <div className={`absolute top-22 left-15 z-[1000] bg-white/90 backdrop-blur-xl rounded-md shadow-2xl border border-gray-200/30 p-6 w-84 transition-all duration-300 ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="p-3 rounded-xl shadow-lg"
            style={{ background: config.gradient }}
          >
            {vehicleTypeIcons[vehicle.type] || vehicleTypeIcons.car}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-2xl text-gray-900">{vehicle.name}</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {config.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Signal size={12} className="text-green-500" />
              <span className="text-sm text-gray-600">Connected • Live Tracking</span>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="text-gray-600" size={16} />
                <span className="text-xs font-medium text-gray-600">Speed</span>
              </div>
              <Radar size={14} className="text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="font-bold text-2xl text-gray-900">{vehicleMetrics.speed.toFixed(0)}</p>
              <span className="text-xs text-gray-500">km/h</span>
            </div>
          </div>
     
        </div>

        {/* Enhanced Coordinates Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="text-green-600" size={18} />
            </div>
            <h3 className="font-semibold text-gray-800">Live Location</h3>
            <Satellite size={14} className="text-gray-400 ml-auto" />
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500 block mb-1">Latitude</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-lg text-gray-900">{coords.lat.toFixed(6)}</code>
                  <span className="text-xs text-gray-500">°N</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 block mb-1">Longitude</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-lg text-gray-900">{coords.lng.toFixed(6)}</code>
                  <span className="text-xs text-gray-500">°E</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-500" />
              <span className="text-gray-600">Last Updated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={shareTrackingLink}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-800 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2 border border-gray-200"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={openDirections}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Navigate
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={`w-full h-full transition-all duration-300 ${isFullscreen ? '' : 'pt-0'}`}>
        <MapContainer 
          center={[coords.lat, coords.lng]} 
          zoom={15} 
          className="w-full h-full rounded-2xl"
          zoomControl={true}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Route History */}
          {routeHistory.length > 1 && (
            <>
              <Polyline
                positions={routeHistory}
                pathOptions={{
                  color: config.color,
                  weight: 4,
                  opacity: 0.6,
                  lineCap: "round",
                  lineJoin: "round",
                  className: "route-history"
                }}
              />
              <Polyline
                positions={routeHistory}
                pathOptions={{
                  color: "white",
                  weight: 2,
                  opacity: 0.8,
                  lineCap: "round",
                  lineJoin: "round",
                  dashArray: "10, 15",
                  className: "route-dashed"
                }}
              />
            </>
          )}

          {/* Accuracy Circle */}
          <Circle
            center={[coords.lat, coords.lng]}
            radius={20}
            pathOptions={{
              fillColor: config.color,
              color: "white",
              weight: 3,
              opacity: 0.3,
              fillOpacity: 0.1,
              className: "accuracy-circle"
            }}
          />

          {/* Main Vehicle Marker */}
          <Marker position={[coords.lat, coords.lng]} icon={createEnhancedIcon(vehicle.type)}>
            <Popup className="enhanced-popup">
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: config.gradient }}
                  >
                    {vehicleTypeIcons[vehicle.type]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">📍 Location:</span>
                    <code className="font-mono text-gray-800">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">⚡ Speed:</span>
                    <span className="font-medium">{vehicleMetrics.speed.toFixed(0)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">⏱️ Updated:</span>
                    <span className="font-medium">{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Enhanced Legend */}
      <div className={`absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 p-5 transition-all duration-300 ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <Radar size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Live Tracking</div>
            <div className="text-xs text-gray-500">Real-time location updates</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{ background: config.gradient }}></div>
              <div className="absolute -inset-1 rounded-full animate-ping opacity-30" style={{ background: config.color }}></div>
            </div>
            <span className="text-sm text-gray-700">Vehicle Position</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full border-2 border-dashed" style={{ borderColor: config.color }}></div>
            <span className="text-sm text-gray-700">Travel Path</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></div>
            <span className="text-sm text-gray-700">Accuracy Radius</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          70% { opacity: 0.2; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .enhanced-marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 65px;
          height: 65px;
        }

        .marker-outer-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.610, 0.355, 1);
        }

        .marker-middle-ring {
          position: absolute;
          width: 80%;
          height: 80%;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 1.5s infinite cubic-bezier(0.215, 0.610, 0.355, 1);
          animation-delay: 0.2s;
        }

        .marker-inner-glow {
          position: absolute;
          width: 70%;
          height: 70%;
          border-radius: 50%;
          opacity: 0.4;
          filter: blur(4px);
        }

        .marker-main {
          position: relative;
          z-index: 10;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }

        .marker-main img {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
          transition: transform 0.3s ease;
        }

        .marker-main:hover {
          transform: scale(1.15);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .marker-main:hover img {
          transform: scale(1.1);
        }

        .live-indicator {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 20;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: #10B981;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          animation: pulse-ring 1s infinite;
        }

        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }

        .enhanced-vehicle-icon {
          background: transparent !important;
          border: none !important;
        }

        .enhanced-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .enhanced-popup .leaflet-popup-content {
          margin: 0 !important;
        }

        .route-history {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .route-dashed {
          filter: drop-shadow(0 1px 2px rgba(255,255,255,0.8));
        }

        .accuracy-circle {
          animation: pulse-ring 3s infinite;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }

        .leaflet-control-zoom a {
          border-radius: 0 !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          background: transparent !important;
        }

        .leaflet-control-zoom a:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }

        .leaflet-control-zoom-in {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default Lander;