import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Car, Bike, Truck, Bus, Users, Activity, Loader2, Navigation, Zap } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

import { useAppContext } from "../contexts/AppContext";
import { getVehiclesByUser, addVehicle as apiAddVehicle, deleteVehicle as apiDeleteVehicle } from "../api/vehicleApi";
import { vehicleTypeData, getRouteColor } from "../constants/vehicleConfig";
import { getVehicleDivIcon, previewMarkerIcon } from "../utils/leafletSetup";
import AddVehicleForm from "../components/map/AddVehicleForm";
import VehiclePopup from "../components/map/VehiclePopup";

// Stats icons mapping
const statsIcons = {
  car: <Car className="text-blue-500" size={20} />,
  bike: <Bike className="text-red-500" size={20} />,
  truck: <Truck className="text-amber-500" size={20} />,
  bus: <Bus className="text-green-500" size={20} />,
};

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const { socket } = useAppContext();
  const [open, setOpen] = useState(false);
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
  const [activeVehicle, setActiveVehicle] = useState(null);
  const { user } = useUser();
  const mapRef = useRef();
  const navigate = useNavigate();

  // Calculate vehicle telemetry stats
  const vehicleStats = useMemo(() => ({
    total: vehicles.length,
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {}),
    active: vehicles.length,
  }), [vehicles]);

  // Socket location update handler for real-time fleet movement
  const handleLocationUpdate = useCallback((data) => {
    if (data.userId !== user?.id) return;

    setVehicles((prev) =>
      prev.map((v) =>
        v.vehicleId === data.vehicleId
          ? {
              ...v,
              lat: data.lat,
              lng: data.lng,
              route: data.route || v.route,
            }
          : v
      )
    );
  }, [user?.id]);

  // Load user's vehicles on mount or when user changes
  useEffect(() => {
    if (!user) return;

    const fetchVehicles = async () => {
      try {
        const data = await getVehiclesByUser(user.id);
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to load vehicles");
      }
    };

    fetchVehicles();

    socket.on("locationUpdate", handleLocationUpdate);

    return () => {
      socket.off("locationUpdate", handleLocationUpdate);
    };
  }, [user, socket, handleLocationUpdate]);

  // Map click handler to select latitude/longitude for a new vehicle
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (open) {
          setNewVehicle((prev) => ({
            ...prev,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          }));
          toast.info("📍 Location selected! Fill vehicle details and save.");
        }
      },
    });
    return null;
  };

  // Add and register new vehicle
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.lat || !newVehicle.lng) {
      toast.warning("Please fill all fields and select a location!");
      return;
    }

    setLoading((prev) => ({ ...prev, adding: true }));

    try {
      const createdVehicle = await apiAddVehicle({
        ...newVehicle,
        userId: user.id,
        vehicleId: `VH-${Date.now()}`,
      });
      setVehicles((prev) => [...prev, createdVehicle]);
      setOpen(false);
      setNewVehicle({ name: "", type: "car", lat: null, lng: null });
      toast.success("🚗 Vehicle added successfully!");
    } catch (err) {
      console.error("Error adding vehicle:", err);
      toast.error("Failed to add vehicle");
    } finally {
      setLoading((prev) => ({ ...prev, adding: false }));
    }
  }, [newVehicle, user?.id]);

  // Remove / Stop vehicle
  const handleStop = useCallback(async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;

    setLoading((prev) => ({ ...prev, removing: true, removingId: vehicleId }));

    try {
      await apiDeleteVehicle(user.id, vehicleId);
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleId));
      toast.success("🗑️ Vehicle removed successfully!");
    } catch (err) {
      console.error("Error removing vehicle:", err);
      toast.error("Error removing vehicle");
    } finally {
      setLoading((prev) => ({ ...prev, removing: false, removingId: null }));
    }
  }, [user?.id]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      {/* Modern Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/home" className="group">
              <div className="relative">
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  className="h-14 w-14 transition-transform group-hover:scale-105"
                />
                <div className="absolute -inset-2 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Fleet Dashboard
              </h1>
              <p className="text-sm text-gray-600">Real-time vehicle tracking</p>
            </div>
          </div>

          <button
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-5 py-3 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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

      {/* Enhanced Stats Bar */}
      <div className="absolute top-22 left-14 z-[1000] bg-white/90 backdrop-blur-xl rounded-md shadow-2xl border border-gray-200/30 p-5 w-72">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-green-600 rounded-lg">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Vehicle Statistics</h2>
            <p className="text-xs text-gray-500">Live tracking overview</p>
          </div>
        </div>

        <div className="space-y-5">
          <div
            onClick={() => navigate("/user-dashboard")}
            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicleStats.total}</p>
                </div>
              </div>
              <Zap className="text-green-500" size={20} />
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(vehicleStats.byType).map(([type, count]) => {
              const color = vehicleTypeData[type]?.color || "#3B82F6";
              return (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      {statsIcons[type]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{type}</p>
                      <p className="text-xs text-gray-500">{count} active</p>
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="absolute -inset-1 bg-green-500 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="pt-20 w-full h-full">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          className="w-full h-full rounded-2xl"
          zoomControl={true}
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <LocationSelector />

          {vehicles.map((v) => (
            <React.Fragment key={v.vehicleId}>
              {/* Vehicle Marker */}
              <Marker
                position={[v.lat, v.lng]}
                icon={getVehicleDivIcon(v)}
                eventHandlers={{
                  click: () => setActiveVehicle(v.vehicleId),
                }}
              >
                <Popup>
                  <VehiclePopup
                    vehicle={v}
                    handleStop={handleStop}
                    isLoading={loading.removing && loading.removingId === v.vehicleId}
                  />
                </Popup>
              </Marker>

              {/* Enhanced Vehicle Route */}
              {v.route && v.route.length > 1 && (
                <>
                  {/* Glow effect */}
                  <Polyline
                    positions={v.route.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: "white",
                      weight: 12,
                      opacity: 0.4,
                      lineCap: "round",
                      lineJoin: "round",
                      className: "route-glow",
                    }}
                  />

                  {/* Shadow effect */}
                  <Polyline
                    positions={v.route.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: "rgba(0, 0, 0, 0.2)",
                      weight: 8,
                      opacity: 0.3,
                      lineCap: "round",
                      lineJoin: "round",
                      dashArray: activeVehicle === v.vehicleId ? "none" : "15, 20",
                    }}
                  />

                  {/* Animated pulse line */}
                  {activeVehicle === v.vehicleId && (
                    <Polyline
                      positions={v.route.map((p) => [p.lat, p.lng])}
                      pathOptions={{
                        color: "white",
                        weight: 3,
                        opacity: 0.8,
                        lineCap: "round",
                        dashArray: "5, 20",
                        className: "pulse-line",
                      }}
                    />
                  )}

                  {/* Main route */}
                  <Polyline
                    positions={v.route.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: getRouteColor(v.type),
                      weight: 6,
                      opacity: activeVehicle === v.vehicleId ? 1 : 0.8,
                      lineCap: "round",
                      lineJoin: "round",
                      className: "main-route",
                    }}
                  />

                  {/* Vehicle position indicator */}
                  <Circle
                    center={[v.lat, v.lng]}
                    radius={15}
                    pathOptions={{
                      fillColor: getRouteColor(v.type),
                      color: "white",
                      weight: 3,
                      opacity: 1,
                      fillOpacity: 0.8,
                      className: "vehicle-position-indicator",
                    }}
                  />
                </>
              )}
            </React.Fragment>
          ))}

          {open && newVehicle.lat && newVehicle.lng && (
            <Marker position={[newVehicle.lat, newVehicle.lng]} icon={previewMarkerIcon} />
          )}
        </MapContainer>
      </div>

      {/* Add Vehicle Form Drawer */}
      {open && (
        <AddVehicleForm
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          setOpen={setOpen}
          handleSubmit={handleSubmit}
          isLoading={loading.adding}
        />
      )}

      {/* Enhanced Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 p-5 w-64">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="text-blue-600" size={18} />
          <h3 className="font-bold text-gray-800">Vehicle Legend</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(vehicleTypeData).map(([type, data]) => (
            <div
              key={type}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ background: data.gradient }}
                ></div>
                <div
                  className="absolute -inset-1 rounded-full animate-pulse opacity-30"
                  style={{ background: data.color }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
            </div>
          ))}
        </div>
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="absolute -inset-1 bg-purple-500 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm text-purple-600 font-medium">
                Click map to set location
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map and Marker Styles */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .vehicle-marker-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .vehicle-pulse {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 2s infinite;
          z-index: 1;
        }

        .vehicle-icon {
          position: relative;
          z-index: 2;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }

        .vehicle-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .vehicle-label {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.95);
          color: #1f2937;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .preview-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-pulse {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 1.5s infinite;
        }

        .preview-icon {
          position: relative;
          z-index: 2;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        }

        .preview-icon::before {
          content: "+";
          color: white;
          font-size: 20px;
          font-weight: bold;
        }

        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }

        .custom-vehicle-icon {
          background: transparent !important;
          border: none !important;
        }

        .route-glow {
          filter: blur(6px) opacity(0.5);
        }

        @keyframes pulse-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 25;
          }
        }

        .pulse-line {
          animation: pulse-dash 1.5s linear infinite;
        }

        .main-route:hover {
          filter: brightness(1.2);
          stroke-width: 7px !important;
          transition: all 0.3s ease;
        }

        .vehicle-position-indicator {
          animation: pulse-ring 2s infinite;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .leaflet-popup-tip {
          backdrop-filter: blur(10px);
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }

        .leaflet-control-zoom a {
          border-radius: 0 !important;
        }

        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }

        .leaflet-control-zoom-in {
          border-bottom: 1px solid #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};

export default MapView;