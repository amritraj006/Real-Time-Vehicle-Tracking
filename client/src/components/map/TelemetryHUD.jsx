import React, { useState } from "react";
import {
  X,
  Gauge,
  BatteryCharging,
  Compass,
  Navigation,
  Share2,
  ExternalLink,
  Target,
  Route as RouteIcon,
  Activity,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleTypeData } from "../../constants/vehicleConfig";

/**
 * Unified floating vehicle details & telemetry panel.
 * Styled in clean light aesthetic matching Home page.
 */
const TelemetryHUD = ({
  vehicle,
  onClose,
  isFollowing,
  onToggleFollow,
  onCenterVehicle,
  handleStop,
  isRemoving,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!vehicle) return null;

  const config = vehicleTypeData[vehicle.type] || vehicleTypeData.car;
  const speed = vehicle.speed !== undefined ? Math.round(vehicle.speed) : 0;
  const isMoving = speed > 2;
  const battery = vehicle.battery !== undefined ? Math.round(vehicle.battery) : 82;
  const heading = vehicle.heading !== undefined ? Math.round(vehicle.heading) : 0;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`);
    if (window.toast) window.toast.success("GPS coordinates copied!");
  };

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${vehicle.lat},${vehicle.lng}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/track/${vehicle.vehicleId}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Tracking *${vehicle.name}* Live:\n${url}`)}`,
      "_blank"
    );
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[700px] z-[1000] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-800 rounded-2xl shadow-xl overflow-hidden">

        {/* ── Header (always visible) ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          {/* Vehicle identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2 rounded-xl shrink-0 flex items-center justify-center text-white shadow-xs"
              style={{ background: config.gradient }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: config.svg }}
                className="w-5 h-5 flex items-center justify-center"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 leading-none truncate">
                  {vehicle.name}
                </h3>
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: `${config.color}15`, color: config.color }}
                >
                  {vehicle.type}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isMoving ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {vehicle.lat.toFixed(5)}°N, {vehicle.lng.toFixed(5)}°E
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Lock Camera */}
            <button
              onClick={onToggleFollow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isFollowing
                  ? "bg-green-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Auto-follow this vehicle on the map"
            >
              <Target size={13} className={isFollowing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">
                {isFollowing ? "Following" : "Lock Camera"}
              </span>
            </button>

            {/* Copy GPS */}
            <button
              onClick={copyCoordinates}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy GPS coordinates"
            >
              <Copy size={15} />
            </button>

            {/* Collapse / Expand toggle */}
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={collapsed ? "Expand details" : "Collapse details"}
            >
              {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Close / Deselect */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Collapsible body ── */}
        {!collapsed && (
          <div className="p-4 space-y-3.5">
            {/* Telemetry Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Speed */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                  <span className="flex items-center gap-1"><Gauge size={12} className="text-blue-600" /> Speed</span>
                  <span className={`w-2 h-2 rounded-full ${isMoving ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-slate-900">{speed}</span>
                  <span className="text-xs text-slate-400">km/h</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((speed / 120) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Battery */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                  <span className="flex items-center gap-1"><BatteryCharging size={12} className="text-green-600" /> Battery</span>
                  <span className={`text-[10px] font-bold ${battery > 50 ? "text-green-700" : battery > 20 ? "text-amber-700" : "text-red-700"}`}>
                    {battery > 50 ? "Good" : battery > 20 ? "Low" : "Critical"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-slate-900">{battery}</span>
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${battery > 50 ? "bg-green-500" : battery > 20 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${battery}%` }}
                  />
                </div>
              </div>

              {/* Bearing */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                  <span className="flex items-center gap-1"><Compass size={12} className="text-amber-600" /> Bearing</span>
                  <span className="font-mono text-[10px] text-slate-700">{heading}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {heading >= 315 || heading < 45 ? "N" : heading < 135 ? "E" : heading < 225 ? "S" : "W"}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-xs"
                    style={{ transform: `rotate(${heading}deg)` }}
                  >
                    <div className="w-0.5 h-3 bg-red-500 rounded-full -translate-y-1" />
                  </div>
                </div>
              </div>

              {/* GPS Fix */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                  <span className="flex items-center gap-1"><Activity size={12} className="text-purple-600" /> GPS Fix</span>
                  <span className="text-green-700 text-[10px] font-bold">Live</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 space-y-0.5 mt-1">
                  <p>{vehicle.lat.toFixed(5)}° N</p>
                  <p>{vehicle.lng.toFixed(5)}° E</p>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={onCenterVehicle}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Navigation size={13} /> Center View
                </button>
                <button
                  onClick={openDirections}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-all cursor-pointer"
                >
                  <RouteIcon size={13} /> Directions
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-semibold border border-green-200 transition-all cursor-pointer"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/track/${vehicle.vehicleId}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  Full Telemetry <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => handleStop(vehicle.vehicleId)}
                  disabled={isRemoving}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                  title="Remove this vehicle from tracking"
                >
                  <Trash2 size={13} />
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelemetryHUD;
