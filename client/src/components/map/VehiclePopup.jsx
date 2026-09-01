import React from "react";
import {
  Car,
  Bike,
  Truck,
  Bus,
  MapPin,
  Clock,
  Gauge,
  Zap,
  Navigation,
  Share2,
  Trash2,
  ExternalLink,
  Copy,
  Activity,
  BatteryCharging,
  Compass,
  Footprints,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { vehicleTypeData } from "../../constants/vehicleConfig";

const vehicleIcons = {
  car: <Car className="text-blue-500" size={18} />,
  bike: <Bike className="text-red-500" size={18} />,
  truck: <Truck className="text-amber-500" size={18} />,
  bus: <Bus className="text-emerald-500" size={18} />,
};

/**
 * Interactive popup displayed when clicking a vehicle marker on the map.
 */
const VehiclePopup = ({ vehicle, handleStop, isLoading, onFocus }) => {
  const { frontendUrl } = useAppContext();
  const config = vehicleTypeData[vehicle.type] || vehicleTypeData.car;

  const trackingURL = `${frontendUrl || window.location.origin}/track/${vehicle.vehicleId}`;
  const shareText = `🚗 *${vehicle.name}*\nLive Telemetry Tracking:\n${trackingURL}`;

  const speed = vehicle.speed !== undefined ? Math.round(vehicle.speed) : 48;
  const isMoving = speed > 2;
  const battery = vehicle.battery !== undefined ? vehicle.battery : 84;
  const heading = vehicle.heading !== undefined ? vehicle.heading : 120;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const copyLocation = () => {
    navigator.clipboard.writeText(trackingURL);
    if (window.toast) {
      window.toast.success("📋 Tracking link copied!");
    } else {
      alert("Tracking link copied to clipboard!");
    }
  };

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${vehicle.lat},${vehicle.lng}`,
      "_blank"
    );
  };

  return (
    <div className="w-[300px] p-0 font-sans bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
      {/* Header Banner */}
      <div
        className="p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.color}ee, #1e293b)`,
        }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-xs">
              {vehicleIcons[vehicle.type] || <Car size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                {vehicle.name}
              </h3>
              <p className="text-[11px] text-white/80 capitalize font-medium">
                {vehicle.type} Unit • ID: {vehicle.vehicleId.slice(-6)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isMoving ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {isMoving ? "Moving" : "Idle"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        
        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Speed */}
          <div className="bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-semibold mb-0.5">
              <Gauge size={11} className="text-blue-500" /> Speed
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white">
              {speed} <span className="text-[10px] font-normal text-gray-500">km/h</span>
            </p>
          </div>

          {/* Battery / Fuel */}
          <div className="bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-semibold mb-0.5">
              <BatteryCharging size={11} className="text-emerald-500" /> Battery
            </div>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {battery}%
            </p>
          </div>

          {/* Heading Compass */}
          <div className="bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-semibold mb-0.5">
              <Compass size={11} className="text-amber-500" /> Heading
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white font-mono">
              {heading}°
            </p>
          </div>
        </div>

        {/* GPS Coordinates Pill */}
        <div className="bg-blue-50/70 dark:bg-gray-800/60 p-2.5 rounded-xl border border-blue-100 dark:border-gray-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
              {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
            </div>
          </div>
          <button
            onClick={copyLocation}
            title="Copy Coordinates / Link"
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 cursor-pointer"
          >
            <Copy size={13} />
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={openDirections}
            className="flex flex-col items-center justify-center p-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800/50 transition-all group cursor-pointer"
          >
            <Navigation size={15} className="mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Directions</span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/50 transition-all group cursor-pointer"
          >
            <Share2 size={15} className="mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </button>

          <Link
            to={`/track/${vehicle.vehicleId}`}
            className="flex flex-col items-center justify-center p-2.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800/50 transition-all group"
          >
            <ExternalLink size={15} className="mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold">Telemetry</span>
          </Link>
        </div>

        {/* Delete / Remove Vehicle */}
        <button
          onClick={() => handleStop(vehicle.vehicleId)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/40 transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 size={13} />
          {isLoading ? "Stopping..." : "Stop & Remove Unit"}
        </button>
      </div>
    </div>
  );
};

export default VehiclePopup;