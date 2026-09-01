import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Car,
  Bike,
  Truck,
  Bus,
  Activity,
  Navigation,
  Zap,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  Radio,
  MapPin,
  Compass,
  ShieldCheck,
  Check,
  X,
  LayoutGrid,
  List,
  Gauge,
  Clock,
  Share2,
  AlertCircle,
  LocateFixed,
  Terminal,
  Route as RouteIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAppContext } from "../hooks/useAppContext";
import {
  getVehiclesByUser,
  addVehicle as apiAddVehicle,
  deleteVehicle as apiDeleteVehicle,
} from "../api/vehicleApi";
import { vehicleTypeData, getRouteColor } from "../constants/vehicleConfig";
import { getVehicleDivIcon, calculateBearing } from "../utils/leafletSetup";
import Loader from "../components/common/Loader";

// Quick presets for fast vehicle testing and coordinate placement
const QUICK_PRESETS = [
  { name: "New Delhi Center", lat: 28.6139, lng: 77.209 },
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Gurugram Cyber Hub", lat: 28.495, lng: 77.0895 },
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.326 },
  { name: "Mumbai Marine Drive", lat: 18.9438, lng: 72.8234 },
  { name: "Bengaluru Tech Park", lat: 12.9716, lng: 77.5946 },
];

const vehicleTypesList = [
  { id: "car", label: "Car", icon: Car, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "bike", label: "Bike", icon: Bike, color: "text-red-600 bg-red-50 border-red-200" },
  { id: "truck", label: "Truck", icon: Truck, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "bus", label: "Bus", icon: Bus, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

// Helper component to center and pan map
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

const UserDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { socket, frontendUrl } = useAppContext();

  // Fleet state
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all"); // 'all' | 'moving' | 'idle'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Focused vehicle & Mini-Map state
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
  const [mapZoom, setMapZoom] = useState(13);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Live Telemetry Event Logs (stream)
  const [eventLogs, setEventLogs] = useState([]);
  const logContainerRef = useRef(null);

  // Socket Connection Status
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Form State for new vehicle
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "car",
    vehicleId: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
    lat: 28.6139,
    lng: 77.209,
  });

  // Fetch user's vehicles from API
  const fetchUserVehicles = useCallback(
    async (isManualRefresh = false) => {
      if (!user?.id) return;
      if (isManualRefresh) setRefreshing(true);

      try {
        const data = await getVehiclesByUser(user.id);
        const list = Array.isArray(data) ? data : [];
        setVehicles(list);

        if (list.length > 0) {
          const firstVeh = list[0];
          setMapCenter([firstVeh.lat, firstVeh.lng]);
          if (!selectedVehicleId) {
            setSelectedVehicleId(firstVeh.vehicleId);
          }
        }

        if (isManualRefresh) {
          toast.success("Fleet telemetry refreshed!", { autoClose: 2000 });
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to fetch fleet data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, selectedVehicleId]
  );

  useEffect(() => {
    fetchUserVehicles();
  }, [fetchUserVehicles]);

  // Socket.IO Real-Time Listeners
  useEffect(() => {
    if (!socket) return;

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const onLocationUpdate = (payload) => {
      if (payload.userId && payload.userId !== user?.id && payload.userId !== "all") {
        return;
      }

      const incomingId = payload.vehicleId ?? payload._id;

      setVehicles((prev) => {
        const exists = prev.some((v) => v.vehicleId === incomingId);
        if (!exists) return prev;

        return prev.map((v) => {
          if (v.vehicleId === incomingId) {
            const newBearing = calculateBearing(v.lat, v.lng, payload.lat, payload.lng);
            const updatedRoute = payload.route || (v.route ? [...v.route, { lat: payload.lat, lng: payload.lng }].slice(-50) : [{ lat: payload.lat, lng: payload.lng }]);

            return {
              ...v,
              lat: Number(payload.lat),
              lng: Number(payload.lng),
              speed: payload.speed !== undefined ? payload.speed : v.speed || 0,
              heading: newBearing || payload.heading || v.heading || 0,
              battery: payload.battery !== undefined ? payload.battery : v.battery || 95,
              route: updatedRoute,
              updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
            };
          }
          return v;
        });
      });

      // Add to live event stream
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString(),
        vehicleId: incomingId,
        name: payload.name || "Unit",
        type: payload.type || "car",
        speed: payload.speed !== undefined ? Math.round(payload.speed) : 0,
        lat: Number(payload.lat).toFixed(4),
        lng: Number(payload.lng).toFixed(4),
      };

      setEventLogs((prev) => [newLog, ...prev].slice(0, 30));
    };

    socket.on("locationUpdate", onLocationUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("locationUpdate", onLocationUpdate);
    };
  }, [socket, user?.id]);

  // Selected vehicle object
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.vehicleId === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = vehicles.length;
    const moving = vehicles.filter((v) => (v.speed || 0) > 2).length;
    const idle = total - moving;
    const avgSpeed = total > 0
      ? Math.round(vehicles.reduce((acc, v) => acc + (v.speed || 0), 0) / total)
      : 0;
    const avgBattery = total > 0
      ? Math.round(vehicles.reduce((acc, v) => acc + (v.battery || 95), 0) / total)
      : 100;

    const countsByType = {
      car: vehicles.filter((v) => v.type === "car").length,
      bike: vehicles.filter((v) => v.type === "bike").length,
      truck: vehicles.filter((v) => v.type === "truck").length,
      bus: vehicles.filter((v) => v.type === "bus").length,
    };

    return { total, moving, idle, avgSpeed, avgBattery, countsByType };
  }, [vehicles]);

  // Filtered vehicles based on search and selected tabs
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedTypeFilter !== "all" && v.type !== selectedTypeFilter) return false;
      if (selectedStatusFilter === "moving" && (v.speed || 0) <= 2) return false;
      if (selectedStatusFilter === "idle" && (v.speed || 0) > 2) return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = v.name?.toLowerCase().includes(query);
        const matchesId = v.vehicleId?.toLowerCase().includes(query);
        const matchesType = v.type?.toLowerCase().includes(query);
        return matchesName || matchesId || matchesType;
      }
      return true;
    });
  }, [vehicles, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  // Copy tracking share link to clipboard
  const handleCopyShareLink = (vehicleId) => {
    const base = frontendUrl || window.location.origin;
    const link = `${base}/track/${vehicleId}`;
    navigator.clipboard.writeText(link);
    toast.success(`Share link copied: ${link}`, { autoClose: 2500 });
  };

  // Copy coordinate to clipboard
  const handleCopyCoords = (lat, lng) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    toast.info(`Coordinates copied (${lat.toFixed(4)}, ${lng.toFixed(4)})`, { autoClose: 1800 });
  };

  // Center mini-map on specific vehicle
  const handleLocateVehicle = (v) => {
    setSelectedVehicleId(v.vehicleId);
    setMapCenter([v.lat, v.lng]);
    setMapZoom(15);
  };

  // Get User GPS location for Add Vehicle form
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      toast.warn("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewVehicle((prev) => ({
          ...prev,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }));
        setGpsLoading(false);
        toast.success("Retrieved your current GPS coordinates!");
      },
      (err) => {
        console.error("GPS error:", err);
        setGpsLoading(false);
        toast.error("Could not retrieve GPS location. Please select a preset.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Add Vehicle Form Submit
  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicle.name.trim()) {
      toast.warn("Please enter a vehicle name");
      return;
    }
    if (!newVehicle.lat || !newVehicle.lng) {
      toast.warn("Please set valid coordinates");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: newVehicle.name.trim(),
        type: newVehicle.type,
        vehicleId: newVehicle.vehicleId.trim() || `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
        lat: Number(newVehicle.lat),
        lng: Number(newVehicle.lng),
        userId: user.id,
      };

      const added = await apiAddVehicle(payload);
      toast.success(`Vehicle "${payload.name}" registered successfully!`);

      setVehicles((prev) => [added, ...prev]);
      setSelectedVehicleId(added.vehicleId);
      setMapCenter([added.lat, added.lng]);

      setNewVehicle({
        name: "",
        type: "car",
        vehicleId: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
        lat: 28.6139,
        lng: 77.209,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Add vehicle error:", err);
      toast.error(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Vehicle
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    setIsSubmitting(true);

    try {
      await apiDeleteVehicle(user.id, vehicleToDelete.vehicleId);
      toast.success(`Vehicle "${vehicleToDelete.name}" deleted successfully.`);
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleToDelete.vehicleId));
      if (selectedVehicleId === vehicleToDelete.vehicleId) {
        setSelectedVehicleId(null);
      }
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your fleet dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col font-sans selection:bg-green-600 selection:text-white pb-16">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        className="mt-16 z-[3000]"
      />

      {/* ─── Top Navigation Header ─── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs flex items-center justify-between">
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
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  DASHBOARD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Real-Time Telematics & Fleet Control
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Socket status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
            <span
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? "bg-green-500 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="hidden md:inline">
              {isSocketConnected ? "Live Socket" : "Connecting"}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchUserVehicles(true)}
            disabled={refreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh fleet telemetry"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-green-600" : ""} />
          </button>

          {/* Open Full Map */}
          <Link
            to="/map"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            <MapPin size={15} className="text-green-600" />
            <span>Full Map</span>
          </Link>

          {/* Add Vehicle Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Clerk Profile Menu */}
          <div className="ml-1 pl-2 border-l border-slate-200 flex items-center">
            <UserButton afterSignOutUrl="/home" />
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ─── Hero / Profile Welcome Banner ─── */}
        <div className="relative rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <img
                  src={user?.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"}
                  alt={user?.fullName || "User Avatar"}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-green-500/20 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                  <ShieldCheck size={14} />
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Welcome back, {user?.firstName || user?.fullName || "Fleet Operator"}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {user?.primaryEmailAddress?.emailAddress || "Registered Fleet Account"} &bull; Account:{" "}
                  <code className="text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[11px] font-mono">
                    {user?.id?.slice(0, 14)}...
                  </code>
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                    <Radio size={12} className="animate-pulse text-green-600" /> Live Tracking Active
                  </span>
                  <span>&bull;</span>
                  <span>{vehicles.length} Units Registered</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons in banner */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Deploy Vehicle
              </button>
              <Link
                to="/map"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-xs"
              >
                <Navigation size={15} /> Launch Live Map
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Fleet Telemetry KPI Statistics ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Fleet */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Fleet Size
                </p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {stats.total}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                <Navigation size={22} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="text-blue-600 font-bold">{stats.countsByType.car} Cars</span>
              <span>&bull;</span>
              <span className="text-red-600 font-bold">{stats.countsByType.bike} Bikes</span>
              <span>&bull;</span>
              <span className="text-amber-600 font-bold">{stats.countsByType.truck} Trucks</span>
              <span>&bull;</span>
              <span className="text-emerald-600 font-bold">{stats.countsByType.bus} Buses</span>
            </div>
          </div>

          {/* Card 2: Moving Units */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active / Moving
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-green-600">
                    {stats.moving}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    / {stats.total} units
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl">
                <Activity size={22} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] text-green-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>{stats.idle} parked / static units</span>
            </div>
          </div>

          {/* Card 3: Average Speed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fleet Avg Speed
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <h3 className="text-3xl font-black text-amber-600">
                    {stats.avgSpeed}
                  </h3>
                  <span className="text-xs font-bold text-slate-500">km/h</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
                <Gauge size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Telemetry sync</span>
              <span className="text-amber-700 font-semibold">3 sec</span>
            </div>
          </div>

          {/* Card 4: Battery / Health */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fleet Battery Avg
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <h3 className="text-3xl font-black text-purple-600">
                    {stats.avgBattery}%
                  </h3>
                </div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl">
                <Zap size={22} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgBattery}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main 2-Column Section (Left: Vehicle List & Filters | Right: Live Mini-Map & Event Stream) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── Left Column: Vehicle Management & Telemetry (7 cols) ─── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Search & Filter Header Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* View toggle (Grid / Table) */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end sm:self-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Table View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {/* Type filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Type:
                  </span>
                  {[
                    { id: "all", label: "All" },
                    { id: "car", label: "Cars" },
                    { id: "bike", label: "Bikes" },
                    { id: "truck", label: "Trucks" },
                    { id: "bus", label: "Buses" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTypeFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedTypeFilter === tab.id
                          ? "bg-green-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Status:
                  </span>
                  {[
                    { id: "all", label: "All" },
                    { id: "moving", label: "Moving" },
                    { id: "idle", label: "Idle" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStatusFilter(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedStatusFilter === s.id
                          ? "bg-slate-800 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl mx-auto flex items-center justify-center border border-green-100">
                  <Car size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">No vehicles found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery || selectedTypeFilter !== "all" || selectedStatusFilter !== "all"
                      ? "No vehicles matched your current filters. Try resetting your search."
                      : "You have not registered any vehicles yet. Deploy your first tracking unit to begin."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTypeFilter("all");
                    setSelectedStatusFilter("all");
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
                >
                  <Plus size={15} className="inline mr-1" /> Deploy First Vehicle
                </button>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && filteredVehicles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.vehicleId;
                  const isMoving = (v.speed || 0) > 2;
                  const config = vehicleTypeData[v.type] || vehicleTypeData.car;
                  const batteryVal = v.battery || 95;

                  return (
                    <div
                      key={v.vehicleId}
                      className={`relative bg-white border rounded-2xl p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Card Header: Type Badge & Actions */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-xs relative"
                            style={{ background: config.gradient }}
                          >
                            <div
                              className="w-6 h-6 text-white"
                              dangerouslySetInnerHTML={{ __html: config.svg }}
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                isMoving ? "bg-green-500 animate-pulse" : "bg-amber-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 leading-tight">
                              {v.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <span className="font-mono">{v.vehicleId}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(v.vehicleId);
                                  toast.success(`Copied ID: ${v.vehicleId}`, { autoClose: 1500 });
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                title="Copy Vehicle ID"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status chip */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isMoving
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isMoving ? "MOVING" : "PARKED"}
                        </span>
                      </div>

                      {/* Telemetry Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">Speed</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {Math.round(v.speed || 0)}{" "}
                            <span className="text-[10px] font-normal text-slate-500">km/h</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">Battery</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {batteryVal}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">Heading</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-0.5">
                            <Compass size={12} className="text-slate-500" /> {v.heading || 0}&deg;
                          </p>
                        </div>
                      </div>

                      {/* Coordinates & Route points info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <button
                          onClick={() => handleCopyCoords(v.lat, v.lng)}
                          className="flex items-center gap-1 hover:text-green-600 font-mono transition-colors cursor-pointer text-[11px]"
                          title="Click to copy coordinates"
                        >
                          <MapPin size={12} className="text-slate-400" />
                          <span>
                            {v.lat?.toFixed(4)}, {v.lng?.toFixed(4)}
                          </span>
                        </button>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <RouteIcon size={12} /> {v.route?.length || 1} pts
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleLocateVehicle(v)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <LocateFixed size={13} />
                          <span>Locate</span>
                        </button>

                        <Link
                          to={`/track/${v.vehicleId}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                          <ExternalLink size={13} />
                          <span>Track</span>
                        </Link>

                        <button
                          onClick={() => handleCopyShareLink(v.vehicleId)}
                          className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                          title="Copy share link"
                        >
                          <Share2 size={14} />
                        </button>

                        <button
                          onClick={() => {
                            setVehicleToDelete(v);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition cursor-pointer"
                          title="Delete vehicle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && filteredVehicles.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Vehicle</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Speed</th>
                        <th className="p-3.5">Battery</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVehicles.map((v) => {
                        const isSelected = selectedVehicleId === v.vehicleId;
                        const isMoving = (v.speed || 0) > 2;

                        return (
                          <tr
                            key={v.vehicleId}
                            onClick={() => setSelectedVehicleId(v.vehicleId)}
                            className={`hover:bg-slate-50 transition cursor-pointer ${
                              isSelected ? "bg-green-50/50 font-semibold" : ""
                            }`}
                          >
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    isMoving ? "bg-green-500 animate-pulse" : "bg-amber-400"
                                  }`}
                                />
                                <div>
                                  <div className="text-slate-900 font-bold">{v.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {v.vehicleId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 capitalize text-slate-700">{v.type}</td>
                            <td className="p-3.5 text-slate-900 font-bold">
                              {Math.round(v.speed || 0)} km/h
                            </td>
                            <td className="p-3.5 text-slate-800 font-bold">{v.battery || 95}%</td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                              {v.lat?.toFixed(3)}, {v.lng?.toFixed(3)}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLocateVehicle(v);
                                }}
                                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200"
                                title="Locate on Map"
                              >
                                <LocateFixed size={13} />
                              </button>
                              <Link
                                to={`/track/${v.vehicleId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block p-1.5 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                title="Track live"
                              >
                                <ExternalLink size={13} />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVehicleToDelete(v);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg hover:bg-red-100"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Column: Interactive Live Mini-Map & Telemetry Event Stream (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Embedded Live Leaflet Mini-Map (Satellite View) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-green-50 text-green-600 rounded-xl border border-green-100">
                    <MapPin size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Satellite Live Map</h3>
                    <p className="text-[11px] text-slate-500">
                      {activeVehicle
                        ? `Tracking: ${activeVehicle.name} (${activeVehicle.vehicleId})`
                        : "Click any vehicle to focus and view route"}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                  HD Satellite
                </span>
              </div>

              {/* Map Canvas */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye"
                  />

                  <MapController center={mapCenter} zoom={mapZoom} />

                  {/* Render All Vehicles on Mini-Map */}
                  {vehicles.map((veh) => {
                    const isFocused = selectedVehicleId === veh.vehicleId;
                    const routePositions =
                      veh.route && veh.route.length > 0
                        ? veh.route.map((p) => [p.lat, p.lng])
                        : [[veh.lat, veh.lng]];

                    return (
                      <React.Fragment key={veh.vehicleId}>
                        {/* Route polyline trail if vehicle is focused */}
                        {isFocused && routePositions.length > 1 && (
                          <Polyline
                            positions={routePositions}
                            color={getRouteColor(veh.type)}
                            weight={4}
                            opacity={0.8}
                            dashArray="6, 8"
                          />
                        )}

                        <Marker
                          position={[veh.lat, veh.lng]}
                          icon={getVehicleDivIcon(veh, isFocused)}
                          eventHandlers={{
                            click: () => {
                              setSelectedVehicleId(veh.vehicleId);
                              setMapCenter([veh.lat, veh.lng]);
                            },
                          }}
                        >
                          <Popup className="custom-popup">
                            <div className="p-1 space-y-1 text-slate-900 font-sans">
                              <div className="font-bold text-xs">{veh.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                ID: {veh.vehicleId}
                              </div>
                              <div className="text-[11px] font-semibold text-green-700">
                                Speed: {Math.round(veh.speed || 0)} km/h
                              </div>
                              <Link
                                to={`/track/${veh.vehicleId}`}
                                className="block mt-1 text-center py-1 bg-green-600 text-white rounded text-[10px] font-bold"
                              >
                                Open Full Tracker
                              </Link>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  })}
                </MapContainer>

                {/* Recenter button floating on map */}
                <div className="absolute bottom-3 right-3 z-[400]">
                  <button
                    onClick={() => {
                      if (vehicles.length > 0) {
                        const first = vehicles[0];
                        setMapCenter([first.lat, first.lng]);
                        setMapZoom(12);
                      }
                    }}
                    className="p-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer backdrop-blur"
                    title="Fit all fleet on map"
                  >
                    <LocateFixed size={14} /> Recenter
                  </button>
                </div>
              </div>
            </div>

            {/* Real-Time Telemetry Event Log Stream */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                    <Terminal size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Telemetry Activity</h3>
                    <p className="text-[11px] text-slate-500">Real-time Socket.IO stream logs</p>
                  </div>
                </div>

                <button
                  onClick={() => setEventLogs([])}
                  className="text-[10px] font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Logs Box */}
              <div
                ref={logContainerRef}
                className="w-full h-56 bg-slate-50 font-mono text-[11px] rounded-2xl p-3.5 border border-slate-200 overflow-y-auto space-y-2 text-slate-700 shadow-inner"
              >
                {eventLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                    Listening for incoming live telemetry broadcast...
                  </div>
                ) : (
                  eventLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 leading-relaxed border-b border-slate-200/60 pb-1"
                    >
                      <span className="text-slate-400 font-semibold">{log.time}</span>
                      <span className="text-blue-600 font-bold">{log.vehicleId}</span>
                      <span className="text-slate-600 font-medium">({log.name})</span>
                      <span className="text-green-600 font-bold">{log.speed} km/h</span>
                      <span className="text-slate-400 hidden sm:inline">
                        [{log.lat}, {log.lng}]
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Modal: Add Vehicle Slide-Over / Dialog ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-600 rounded-2xl text-white shadow-sm">
                  <Navigation size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Deploy New Vehicle</h3>
                  <p className="text-xs text-slate-500">
                    Register a new unit on your live tracking grid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddVehicleSubmit} className="space-y-5">
              {/* Vehicle Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vehicle Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Express #104"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:bg-white"
                />
              </div>

              {/* Vehicle Type Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vehicle Type *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {vehicleTypesList.map((type) => {
                    const Icon = type.icon;
                    const isSelected = newVehicle.type === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, type: type.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-green-600 text-white border-green-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={20} className="mb-1" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Vehicle ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Vehicle ID (Unique)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewVehicle({
                        ...newVehicle,
                        vehicleId: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    className="text-[11px] text-green-600 hover:text-green-700 font-semibold cursor-pointer"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={newVehicle.vehicleId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vehicleId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:bg-white"
                />
              </div>

              {/* Coordinates Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Initial Position (Lat, Lng) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={gpsLoading}
                    className="flex items-center gap-1 text-[11px] text-green-600 hover:text-green-700 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Navigation size={12} className={gpsLoading ? "animate-spin" : ""} />
                    <span>{gpsLoading ? "Locating..." : "Use My GPS"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Latitude"
                    value={newVehicle.lat}
                    onChange={(e) => setNewVehicle({ ...newVehicle, lat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-green-500 focus:bg-white"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude"
                    value={newVehicle.lng}
                    onChange={(e) => setNewVehicle({ ...newVehicle, lng: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-green-500 focus:bg-white"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-slate-500 font-medium">Quick Location Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setNewVehicle({
                            ...newVehicle,
                            lat: preset.lat,
                            lng: preset.lng,
                          })
                        }
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Deploying..." : "Deploy Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Delete Confirmation ─── */}
      {isDeleteModalOpen && vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center border border-red-100">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Vehicle</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to remove{" "}
                <span className="text-slate-900 font-bold">{vehicleToDelete.name}</span> (
                <code className="text-red-600 font-semibold">{vehicleToDelete.vehicleId}</code>)? This action will
                stop real-time telematics and remove all stored route history.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setVehicleToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Keep Vehicle
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
