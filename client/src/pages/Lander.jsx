import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useParams } from "react-router-dom";
import {
  Car,
  Bike,
  Truck,
  Bus,
  Footprints,
  Navigation,
  MapPin,
  Clock,
  Gauge,
  Share2,
  Radar,
  Satellite,
  Signal,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAppContext } from "../hooks/useAppContext";
import { getVehicleById } from "../api/vehicleApi";
import { vehicleTypeData } from "../constants/vehicleConfig";
import { getEnhancedVehicleDivIcon } from "../utils/leafletSetup";
import Loader from "../components/common/Loader";

const vehicleTypeIcons = {
  car: <Car className="text-blue-500" size={20} />,
  bike: <Bike className="text-red-500" size={20} />,
  truck: <Truck className="text-amber-500" size={20} />,
  bus: <Bus className="text-green-500" size={20} />,
};

const Lander = () => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  const { socket, frontendUrl } = useAppContext();
  const mapRef = useRef();
  const updateCountRef = useRef(0);

  // Dynamic vehicle telemetry metrics
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

  // Fetch initial vehicle tracking data
  useEffect(() => {
    if (!vehicleId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(vehicleId);
        if (data.success) {
          const vehicleData = data.vehicle;
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
        console.error("Error fetching vehicle:", err);
        toast.error("Failed to load vehicle data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  // Listen for real-time location updates via Socket.io
  useEffect(() => {
    if (!vehicleId) return;

    const handleLocationUpdate = (data) => {
      if (data.vehicleId === vehicleId) {
        updateCountRef.current += 1;
        const newCoords = { lat: data.lat, lng: data.lng };
        setCoords(newCoords);

        // Add to route history (keep last 50 positions)
        setRouteHistory((prev) => {
          const newRoute = [...prev, newCoords];
          return newRoute.slice(-50);
        });

        setVehicle((prev) => ({
          ...prev,
          lat: data.lat,
          lng: data.lng,
        }));

        // Update metrics dynamically
        setVehicleMetrics((prev) => ({
          ...prev,
          speed: Math.max(0, prev.speed + (Math.random() * 4 - 2)),
          fuel: Math.max(0, prev.fuel - 0.1),
          battery: Math.max(0, prev.battery - 0.05),
        }));

        setLastUpdate(new Date());

        // Show toast notification on subsequent updates
        if (updateCountRef.current > 1) {
          toast.info("📍 Location updated", {
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

  // Open Google Maps directions to current vehicle position
  const openDirections = () => {
    if (!coords) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
      "_blank"
    );
  };

  // Share tracking link via Web Share API or Clipboard fallback
  const shareTrackingLink = async () => {
    const trackingLink = `${frontendUrl}/track/${vehicleId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track ${vehicle?.name} Live`,
          text: `Track ${vehicle?.name} in real-time`,
          url: trackingLink,
        });
      } catch {
        await navigator.clipboard.writeText(trackingLink);
        toast.success("📋 Tracking link copied!");
      }
    } else {
      await navigator.clipboard.writeText(trackingLink);
      toast.success("📋 Tracking link copied!");
    }
  };

  // Toggle fullscreen map mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  };

  // Refresh vehicle tracking state manually
  const refreshData = async () => {
    try {
      const data = await getVehicleById(vehicleId);
      if (data.success) {
        setVehicle(data.vehicle);
        toast.success("Data refreshed!");
      }
    } catch (err) {
      console.error("Error refreshing vehicle:", err);
      toast.error("Refresh failed");
    }
  };

  if (loading) return <Loader />;

  if (!coords || !vehicle) {
    return (
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
  }

  const config = vehicleTypeData[vehicle.type] || vehicleTypeData.car;

  return (
    <div
      className={`relative w-full h-screen bg-[#fafafa] font-sans ${
        isFullscreen ? "pt-0" : "pt-20"
      }`}
    >
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
        className="mt-16 z-[3000]"
      />

      {/* Enhanced Header */}
      <header
        className={`absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs transition-all duration-300 ${
          isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/home" className="group flex items-center gap-3">
              <div className="relative">
                <img
                  src="/favicon.svg"
                  className="h-10 w-10 sm:h-11 sm:w-11 transition-all duration-300 group-hover:scale-105"
                  alt="Logo"
                />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-800 leading-none">
                    Tracking: {vehicle.name}
                  </h1>
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Unit ID: <code className="font-mono text-green-700 bg-green-50 px-1 py-0.2 rounded border border-green-200">{vehicleId}</code>
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshData}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
            </button>
            <button
              onClick={openDirections}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Navigation size={15} />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Vehicle Info Panel */}
      <div
        className={`absolute top-20 left-4 sm:left-6 z-[1000] bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-6 w-[320px] sm:w-[360px] max-w-[calc(100vw-32px)] transition-all duration-300 ${
          isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="p-3 rounded-2xl shadow-xs shrink-0 text-white flex items-center justify-center"
            style={{ background: config.gradient }}
          >
            <div className="w-6 h-6 flex items-center justify-center text-white" dangerouslySetInnerHTML={{ __html: config.svg }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-900 truncate">{vehicle.name}</h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {config.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-green-700 font-medium">
              <Signal size={12} className="text-green-600 animate-pulse" />
              <span>Live Telematics Stream</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">Speed</span>
              <Gauge size={13} className="text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="font-black text-xl text-slate-900">{vehicleMetrics.speed.toFixed(0)}</p>
              <span className="text-[10px] text-slate-400">km/h</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">Battery</span>
              <Radar size={13} className="text-green-600" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="font-black text-xl text-slate-900">{vehicleMetrics.battery.toFixed(0)}</p>
              <span className="text-[10px] text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Live Coordinates */}
        <div className="mb-4 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <MapPin size={13} className="text-green-600" /> Position
            </span>
            <Satellite size={13} className="text-slate-400" />
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 flex justify-between">
            <span>{coords.lat.toFixed(5)}° N</span>
            <span>{coords.lng.toFixed(5)}° E</span>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              <span>Last Updated</span>
            </div>
            <span className="font-bold text-slate-800">
              {lastUpdate
                ? lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "--:--"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareTrackingLink}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <button
              onClick={openDirections}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation size={14} />
              <span>Navigate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={`w-full h-full transition-all duration-300 ${isFullscreen ? "" : "pt-0"}`}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={15}
          className="w-full h-full rounded-2xl"
          zoomControl={true}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Route History Paths */}
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
                  className: "route-history",
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
                  className: "route-dashed",
                }}
              />
            </>
          )}

          {/* Accuracy Radius Indicator */}
          <Circle
            center={[coords.lat, coords.lng]}
            radius={20}
            pathOptions={{
              fillColor: config.color,
              color: "white",
              weight: 3,
              opacity: 0.3,
              fillOpacity: 0.1,
              className: "accuracy-circle",
            }}
          />

          {/* Main Vehicle Marker */}
          <Marker position={[coords.lat, coords.lng]} icon={getEnhancedVehicleDivIcon(vehicle.type)}>
            <Popup className="enhanced-popup">
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: config.gradient }}
                  >
                    {vehicleTypeIcons[vehicle.type] || vehicleTypeIcons.car}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{vehicle.type}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">📍 Location:</span>
                    <code className="font-mono text-gray-800">
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">⚡ Speed:</span>
                    <span className="font-medium">{vehicleMetrics.speed.toFixed(0)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">⏱️ Updated:</span>
                    <span className="font-medium">
                      {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--"}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Enhanced Legend */}
      <div
        className={`absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 p-5 transition-all duration-300 ${
          isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
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
              <div
                className="absolute -inset-1 rounded-full animate-ping opacity-30"
                style={{ background: config.color }}
              ></div>
            </div>
            <span className="text-sm text-gray-700">Vehicle Position</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full border-2 border-dashed"
              style={{ borderColor: config.color }}
            ></div>
            <span className="text-sm text-gray-700">Travel Path</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></div>
            <span className="text-sm text-gray-700">Accuracy Radius</span>
          </div>
        </div>
      </div>

      {/* Enhanced Marker & Popup Styles */}
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