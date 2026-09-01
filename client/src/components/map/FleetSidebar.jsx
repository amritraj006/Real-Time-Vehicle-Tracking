import React, { useState, useMemo } from "react";
import {
  Search,
  Car,
  Bike,
  Truck,
  Bus,
  Activity,
  Zap,
  Gauge,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Radio,
  Bell,
  Navigation,
  Compass,
  X,
  Plus,
  Route as RouteIcon,
} from "lucide-react";
import { vehicleTypeData } from "../../constants/vehicleConfig";

const vehicleIcons = {
  car: <Car size={16} />,
  bike: <Bike size={16} />,
  truck: <Truck size={16} />,
  bus: <Bus size={16} />,
};

/**
 * Responsive left sidebar for fleet list, search & filter, live telemetry stats, and event feed.
 * Styled in clean light aesthetic matching the Home page.
 */
const FleetSidebar = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenAddModal,
  isOpen,
  onToggleOpen,
}) => {
  const [activeTab, setActiveTab] = useState("fleet"); // "fleet" | "stats" | "events"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all" | "moving" | "idle"

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || v.type === selectedType;
      const isMoving = (v.speed || 0) > 2;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "moving" && isMoving) ||
        (selectedStatus === "idle" && !isMoving);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, selectedType, selectedStatus]);

  // Telemetry Aggregates
  const stats = useMemo(() => {
    const total = vehicles.length;
    const movingCount = vehicles.filter((v) => (v.speed || 0) > 2).length;
    const idleCount = total - movingCount;
    const totalSpeed = vehicles.reduce((sum, v) => sum + (v.speed || 0), 0);
    const avgSpeed = total > 0 ? Math.round(totalSpeed / total) : 0;
    const byType = vehicles.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});

    return { total, movingCount, idleCount, avgSpeed, byType };
  }, [vehicles]);

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="absolute top-20 left-4 z-[900] bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl p-3 rounded-2xl flex items-center gap-2.5 text-slate-800 hover:bg-white transition-all transform hover:scale-102 cursor-pointer"
          title="Open Fleet Control Panel"
        >
          <div className="p-2 bg-green-600 text-white rounded-xl shadow-xs">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="text-left pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Fleet Control</span>
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded-full">
                {vehicles.length} Units
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Live fleet telematics</p>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      )}

      {/* Main Sidebar Panel */}
      {isOpen && (
        <div className="absolute top-20 left-4 bottom-6 w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)] z-[900] bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-300">
          
          {/* Header */}
          <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-green-600 rounded-xl text-white shadow-xs">
                <Radio size={16} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-none flex items-center gap-2">
                  Fleet Control
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                    LIVE
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {stats.total} total &bull; {stats.movingCount} in motion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAddModal}
                className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all cursor-pointer"
                title="Add New Vehicle"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={onToggleOpen}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-1.5 mx-4 mt-3 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("fleet")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "fleet"
                  ? "bg-white text-green-700 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Car size={13} />
              <span>Fleet ({filteredVehicles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "stats"
                  ? "bg-white text-green-700 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Activity size={13} />
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "events"
                  ? "bg-white text-green-700 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Bell size={13} />
              <span>Logs</span>
            </button>
          </div>

          {/* Tab 1: Fleet List & Search */}
          {activeTab === "fleet" && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 pt-3 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search vehicle name, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:border-green-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
                {["all", "car", "bike", "truck", "bus"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-all cursor-pointer ${
                      selectedType === type
                        ? "bg-green-600 text-white font-bold shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Status toggles */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
                <span className="font-semibold text-slate-600">Status:</span>
                <div className="flex items-center gap-1">
                  {["all", "moving", "idle"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2 py-0.5 rounded-md capitalize cursor-pointer text-[10px] font-bold ${
                        selectedStatus === st
                          ? "bg-slate-800 text-white"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Vehicle List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredVehicles.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-xs font-semibold">No vehicles found</p>
                    <p className="text-[11px] mt-1">Try adjusting search or filters</p>
                  </div>
                ) : (
                  filteredVehicles.map((v) => {
                    const isSelected = activeVehicleId === v.vehicleId;
                    const isMoving = (v.speed || 0) > 2;
                    const config = vehicleTypeData[v.type] || vehicleTypeData.car;

                    return (
                      <div
                        key={v.vehicleId}
                        onClick={() => onSelectVehicle(v)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-green-50/50 border-green-500 shadow-sm"
                            : "bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ background: config.gradient }}
                            >
                              <div
                                dangerouslySetInnerHTML={{ __html: config.svg }}
                                className="w-4 h-4"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {v.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {v.vehicleId}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isMoving ? "bg-green-500 animate-pulse" : "bg-amber-400"
                                }`}
                              />
                              <span className="text-[11px] font-bold text-slate-800">
                                {Math.round(v.speed || 0)} km/h
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {v.battery || 95}% bat
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Aggregate Stats */}
          {activeTab === "stats" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Total Units</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl border border-green-200 text-center">
                  <p className="text-[10px] uppercase font-semibold text-green-700">In Motion</p>
                  <p className="text-xl font-bold text-green-700 mt-0.5">{stats.movingCount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Avg Speed</p>
                  <p className="text-xl font-bold text-amber-600 mt-0.5">{stats.avgSpeed} km/h</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Parked Units</p>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">{stats.idleCount}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Fleet Breakdown</h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center capitalize text-slate-600">
                      <span>{type}</span>
                      <span className="font-bold text-slate-800">{count} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Live Logs */}
          {activeTab === "events" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] text-slate-600">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800 font-sans">System Diagnostics</p>
                <div className="flex items-center gap-1 text-green-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Socket.IO Connected (3s sync)</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Live updates are dynamically simulated & broadcasted across all nodes.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FleetSidebar;
