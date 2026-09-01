import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Plus,
  Car,
  Bike,
  Truck,
  Bus,
  Activity,
  Loader2,
  Navigation,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  Compass,
  Radio,
  Share2,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

import { useAppContext } from "../hooks/useAppContext";
import {
  getVehiclesByUser,
  addVehicle as apiAddVehicle,
  deleteVehicle as apiDeleteVehicle,
} from "../api/vehicleApi";
import { vehicleTypeData, getRouteColor } from "../constants/vehicleConfig";
import {
  getVehicleDivIcon,
  previewMarkerIcon,
  userLocationIcon,
  calculateBearing,
} from "../utils/leafletSetup";

import AddVehicleForm from "../components/map/AddVehicleForm";
import TelemetryHUD from "../components/map/TelemetryHUD";
import FleetSidebar from "../components/map/FleetSidebar";
import MapControls, { MAP_LAYERS } from "../components/map/MapControls";

/**
 * Helper hook to capture map instance
 */
const MapInstanceCapture = ({ setMapInstance }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);
  return null;
};

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { socket } = useAppContext();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "car",
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState({
    adding: false,
    removing: false,
    removingId: null,
  });

  // Active focused vehicle ID
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Map Controls State
  const [currentLayer, setCurrentLayer] = useState(MAP_LAYERS[0]); // Default Clean Streets
  const [userLocation, setUserLocation] = useState(null);

  // Sidebar and UI visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const { user } = useUser();
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Active vehicle object
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.vehicleId === activeVehicleId) || vehicles[0] || null;
  }, [vehicles, activeVehicleId]);

  // Set map instance reference
  const handleSetMapInstance = useCallback((map) => {
    mapInstanceRef.current = map;
  }, []);

  // Update vehicle telemetry on socket event
  const handleLocationUpdate = useCallback(
    (data) => {
      if (data.userId !== user?.id && data.userId !== "all") return;

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.vehicleId === data.vehicleId) {
            const newBearing = calculateBearing(v.lat, v.lng, data.lat, data.lng);
            const updatedRoute = data.route || (v.route ? [...v.route, { lat: data.lat, lng: data.lng }].slice(-50) : [{ lat: data.lat, lng: data.lng }]);
            return {
              ...v,
              lat: data.lat,
              lng: data.lng,
              heading: newBearing || data.heading || v.heading || 0,
              speed: data.speed !== undefined ? data.speed : v.speed || 0,
              battery: data.battery !== undefined ? data.battery : (v.battery || 95),
              route: updatedRoute,
            };
          }
          return v;
        })
      );
    },
    [user?.id]
  );

  // Auto camera follow if follow mode is active
  useEffect(() => {
    if (isFollowing && activeVehicle && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([activeVehicle.lat, activeVehicle.lng], {
        animate: true,
        duration: 1,
      });
    }
  }, [isFollowing, activeVehicle?.lat, activeVehicle?.lng]);

  // Load user's vehicles on mount
  useEffect(() => {
    if (!user) return;

    const fetchVehicles = async () => {
      try {
        const data = await getVehiclesByUser(user.id);
        const enriched = data.map((v) => ({
          ...v,
          speed: v.speed !== undefined ? v.speed : 0,
          heading: v.heading !== undefined ? v.heading : 0,
          battery: v.battery !== undefined ? v.battery : 98,
          route: v.route && v.route.length > 0 ? v.route : [{ lat: v.lat, lng: v.lng }],
        }));
        setVehicles(enriched);
        if (enriched.length > 0 && !activeVehicleId) {
          setActiveVehicleId(enriched[0].vehicleId);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to load vehicles");
      }
    };

    fetchVehicles();

    if (socket) {
      socket.on("locationUpdate", handleLocationUpdate);
    }

    return () => {
      if (socket) {
        socket.off("locationUpdate", handleLocationUpdate);
      }
    };
  }, [user, socket, handleLocationUpdate]);

  // Click on map to select coordinates for new vehicle
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (openAddModal) {
          setNewVehicle((prev) => ({
            ...prev,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          }));
          toast.info("📍 Coordinates locked! Enter vehicle name & deploy.");
        }
      },
    });
    return null;
  };

  // Add and register new vehicle
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!newVehicle.name || !newVehicle.lat || !newVehicle.lng) {
        toast.warning("Please fill vehicle name and select a location!");
        return;
      }

      setLoading((prev) => ({ ...prev, adding: true }));

      try {
        const createdVehicle = await apiAddVehicle({
          ...newVehicle,
          userId: user.id,
          vehicleId: `VH-${Date.now()}`,
        });

        const enrichedCreated = {
          ...createdVehicle,
          speed: 0,
          heading: 0,
          battery: 98,
          route: [{ lat: newVehicle.lat, lng: newVehicle.lng }],
        };

        setVehicles((prev) => [...prev, enrichedCreated]);
        setOpenAddModal(false);
        setActiveVehicleId(enrichedCreated.vehicleId);

        // Fly map to new vehicle
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newVehicle.lat, newVehicle.lng], 15, {
            duration: 1.5,
          });
        }

        setNewVehicle({ name: "", type: "car", lat: null, lng: null });
        toast.success(`🚀 ${enrichedCreated.name} deployed to real-time grid!`);
      } catch (err) {
        console.error("Error adding vehicle:", err);
        toast.error(err.response?.data?.message || "Failed to add vehicle");
      } finally {
        setLoading((prev) => ({ ...prev, adding: false }));
      }
    },
    [newVehicle, user?.id]
  );

  // Remove / Stop vehicle
  const handleStop = useCallback(
    async (vehicleId) => {
      if (!window.confirm("Are you sure you want to stop and remove this vehicle?")) return;

      setLoading((prev) => ({ ...prev, removing: true, removingId: vehicleId }));

      try {
        await apiDeleteVehicle(user.id, vehicleId);
        setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleId));
        if (activeVehicleId === vehicleId) {
          setActiveVehicleId(null);
          setIsFollowing(false);
        }
        toast.success("🗑️ Unit successfully decommissioned!");
      } catch (err) {
        console.error("Error removing vehicle:", err);
        toast.error("Error removing vehicle");
      } finally {
        setLoading((prev) => ({ ...prev, removing: false, removingId: null }));
      }
    },
    [user?.id, activeVehicleId]
  );

  // Fly to and select vehicle
  const handleSelectVehicle = useCallback((vehicle) => {
    setActiveVehicleId(vehicle.vehicleId);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([vehicle.lat, vehicle.lng], 16, {
        duration: 1.2,
      });
    }
  }, []);

  // Fit bounds to all vehicles in fleet
  const handleFitBounds = useCallback(() => {
    if (!mapInstanceRef.current || vehicles.length === 0) return;
    const latLngs = vehicles.map((v) => [v.lat, v.lng]);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    toast.info("🗺️ Camera centered on all fleet units");
  }, [vehicles]);

  // Geolocation trigger
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
    toast.info("📡 Acquiring GPS position...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, {
            duration: 1.5,
          });
        }
        toast.success("📍 Your location acquired!");
      },
      (err) => {
        console.error(err);
        toast.error("Could not retrieve GPS location");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950 font-sans select-none">
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
        className="mt-16 z-[2000]"
      />

      {/* Top Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/home" className="group flex items-center gap-3">
            <div className="relative">
              <img
                src="/favicon.svg"
                alt="Logo"
                className="h-10 w-10 sm:h-11 sm:w-11 transition-transform group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-none">
                  Fleet Tracker
                </h1>
                <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Real-Time Telematics & Geospatial Tracking
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/user-dashboard")}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <Activity size={14} className="text-green-600" /> Dashboard
          </button>

          <button
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-70 bg-green-600 hover:bg-green-700 active:scale-95"
            onClick={() => setOpenAddModal(true)}
            disabled={loading.adding}
          >
            {loading.adding ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            <span>Add Vehicle</span>
          </button>
        </div>
      </header>

      {/* Main Map Container */}
      <div className="w-full h-full">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <MapInstanceCapture setMapInstance={handleSetMapInstance} />
          
          {/* Dynamic Switchable Tile Layer */}
          <TileLayer
            key={currentLayer.id}
            attribution={currentLayer.attribution}
            url={currentLayer.url}
          />

          <LocationSelector />

          {/* User GPS Geolocation Marker */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="p-2 text-xs font-semibold text-gray-800">
                    📍 You are here (GPS Live)
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={300}
                pathOptions={{
                  color: "#3B82F6",
                  fillColor: "#3B82F6",
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: "4, 6",
                }}
              />
            </>
          )}

          {/* Vehicle Markers & Polyline Routes */}
          {vehicles.map((v) => {
            const isSelected = activeVehicleId === v.vehicleId;
            const routeColor = getRouteColor(v.type);

            return (
              <React.Fragment key={v.vehicleId}>
                {/* Vehicle Marker — click to select & open the unified panel below */}
                <Marker
                  position={[v.lat, v.lng]}
                  icon={getVehicleDivIcon(v, isSelected)}
                  eventHandlers={{
                    click: () => setActiveVehicleId(v.vehicleId),
                  }}
                />

                {/* Enhanced Realistic Route History Polylines */}
                {v.route && v.route.length > 1 && (
                  <>
                    {/* Glowing outer neon halo */}
                    <Polyline
                      positions={v.route.map((p) => [p.lat, p.lng])}
                      pathOptions={{
                        color: routeColor,
                        weight: isSelected ? 12 : 8,
                        opacity: isSelected ? 0.35 : 0.15,
                        lineCap: "round",
                        lineJoin: "round",
                        className: "route-glow",
                      }}
                    />

                    {/* Animated dashed pulse trail */}
                    {isSelected && (
                      <Polyline
                        positions={v.route.map((p) => [p.lat, p.lng])}
                        pathOptions={{
                          color: "#ffffff",
                          weight: 3,
                          opacity: 0.9,
                          lineCap: "round",
                          dashArray: "8, 16",
                          className: "pulse-line",
                        }}
                      />
                    )}

                    {/* Main solid path line */}
                    <Polyline
                      positions={v.route.map((p) => [p.lat, p.lng])}
                      pathOptions={{
                        color: routeColor,
                        weight: isSelected ? 5 : 3.5,
                        opacity: isSelected ? 1 : 0.8,
                        lineCap: "round",
                        lineJoin: "round",
                        className: "main-route",
                      }}
                    />


                  </>
                )}

                {/* Selected vehicle pulsing radar ring */}
                {isSelected && (
                  <Circle
                    center={[v.lat, v.lng]}
                    radius={100}
                    pathOptions={{
                      color: routeColor,
                      fillColor: routeColor,
                      fillOpacity: 0.1,
                      weight: 1.5,
                      dashArray: "3, 6",
                      className: "radar-scan-ring",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* New Vehicle Placement Crosshair Pin */}
          {openAddModal && newVehicle.lat && newVehicle.lng && (
            <Marker
              position={[newVehicle.lat, newVehicle.lng]}
              icon={previewMarkerIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Responsive Left Fleet Control Sidebar */}
      <FleetSidebar
        vehicles={vehicles}
        activeVehicleId={activeVehicleId}
        onSelectVehicle={handleSelectVehicle}
        onOpenAddModal={() => setOpenAddModal(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Floating Map Controls Widget */}
      <MapControls
        onFitBounds={handleFitBounds}
        onLocateMe={handleLocateMe}
        vehicleCount={vehicles.length}
      />

      {/* Unified Vehicle Details + Telemetry Panel */}
      {activeVehicle && (
        <TelemetryHUD
          vehicle={activeVehicle}
          onClose={() => {
            setActiveVehicleId(null);
            setIsFollowing(false);
          }}
          isFollowing={isFollowing}
          onToggleFollow={() => {
            setIsFollowing((prev) => !prev);
            toast.info(
              !isFollowing
                ? `🎯 Camera locked on ${activeVehicle.name}`
                : "Camera lock released"
            );
          }}
          onCenterVehicle={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([activeVehicle.lat, activeVehicle.lng], 16, {
                duration: 1.2,
              });
            }
          }}
          handleStop={handleStop}
          isRemoving={loading.removing && loading.removingId === activeVehicle.vehicleId}
        />
      )}

      {/* Add Vehicle Slide-over Form Drawer */}
      {openAddModal && (
        <AddVehicleForm
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setOpen={setOpenAddModal}
          handleSubmit={handleSubmit}
          isLoading={loading.adding}
        />
      )}

      {/* Bottom Right Expandable Legend */}
      <div className="absolute bottom-4 right-4 z-[900] hidden sm:block">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 p-3.5 w-60">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
          >
            <div className="flex items-center gap-2">
              <Navigation className="text-green-600" size={15} />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Fleet Key
              </h3>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              {isLegendOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>

          {isLegendOpen && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
              {Object.entries(vehicleTypeData).map(([type, data]) => (
                <div
                  key={type}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full shadow-xs shrink-0"
                    style={{ background: data.gradient }}
                  />
                  <span className="text-xs font-semibold text-slate-700 capitalize">
                    {type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Leaflet & Marker Animations */}
      <style>{`
        /* Custom vehicle marker wrapper */
        .vehicle-marker-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Pulse Ring */
        .vehicle-pulse-ring {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0;
          pointer-events: none;
        }

        .vehicle-marker-wrapper.is-moving .vehicle-pulse-ring,
        .vehicle-marker-wrapper.is-selected .vehicle-pulse-ring {
          animation: radar-wave 2.2s infinite ease-out;
        }

        @keyframes radar-wave {
          0% { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Heading Direction Arrow */
        .vehicle-heading-arrow {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transition: transform 0.4s ease-out;
        }

        .arrow-tip {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 9px solid;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
        }

        /* Vehicle Bubble */
        .vehicle-bubble {
          position: relative;
          z-index: 2;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffffff;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vehicle-marker-wrapper:hover .vehicle-bubble,
        .vehicle-marker-wrapper.is-selected .vehicle-bubble {
          transform: scale(1.18);
          border-color: #f8fafc;
        }

        .vehicle-status-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }

        /* Label Chip */
        .vehicle-label-chip {
          position: absolute;
          bottom: 2px;
          z-index: 3;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 2px 7px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          pointer-events: none;
          max-width: 90px;
          white-space: nowrap;
        }

        .vehicle-name-text {
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vehicle-speed-tag {
          font-size: 9px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 4px;
          border-radius: 4px;
        }

        /* Preview Marker for Add Flow */
        .preview-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .preview-pulse {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.4);
          animation: radar-wave 1.5s infinite ease-out;
        }

        .preview-icon {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5);
        }

        .preview-badge {
          position: relative;
          z-index: 2;
          margin-top: 4px;
          background: #4f46e5;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* User GPS Location Marker */
        .user-gps-marker {
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-gps-pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.4);
          animation: radar-wave 1.8s infinite ease-out;
        }

        .user-gps-dot {
          position: relative;
          z-index: 2;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.6);
        }

        /* Polyline Animations */
        @keyframes pulse-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 24; }
        }

        .pulse-line {
          animation: pulse-dash 1.2s linear infinite;
        }

        .route-glow {
          filter: blur(4px);
        }

        .radar-scan-ring {
          animation: pulse-dash 3s linear infinite;
        }

        /* Leaflet resets */
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          line-height: normal !important;
        }

        .leaflet-popup-tip {
          background: #0f172a !important;
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 9999px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;