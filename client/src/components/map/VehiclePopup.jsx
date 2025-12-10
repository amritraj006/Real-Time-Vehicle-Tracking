import React from "react";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaWhatsapp,
  FaCopy,
  FaDirections,
  FaExclamationTriangle,
  FaGasPump,
  FaBolt,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaClock,
  FaWrench
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useAppContext } from "../../contexts/AppContext";

const vehicleIcons = {
  car: <FaCar className="text-blue-600 text-lg" />,
  bike: <FaMotorcycle className="text-red-600 text-lg" />,
  truck: <FaTruck className="text-amber-600 text-lg" />,
  bus: <FaBus className="text-emerald-600 text-lg" />,
};

const VehiclePopup = ({ vehicle, handleStop, isLoading }) => {
  const { frontendUrl } = useAppContext();
  
  const trackingURL = `${frontendUrl}/track/${vehicle.vehicleId}`;
  const shareText = `🚗 *${vehicle.name}*\nTrack this vehicle live:\n${trackingURL}`;
  
  // Dummy vehicle metrics
  const metrics = {
    fuelLevel: Math.floor(Math.random() * 50) + 50,
    battery: Math.floor(Math.random() * 40) + 60,
    speed: Math.floor(Math.random() * 60) + 20,
    health: ["Good", "Moderate", "Needs Service"][Math.floor(Math.random() * 3)],
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const copyLocation = () => {
    navigator.clipboard.writeText(trackingURL);
    alert("Tracking link copied to clipboard!");
  };

  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${vehicle.lat},${vehicle.lng}`, "_blank");
  };

  const getHealthColor = (health) => {
    switch(health.toLowerCase()) {
      case "good": return "bg-emerald-100 text-emerald-800";
      case "moderate": return "bg-amber-100 text-amber-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="p-0 w-[280px] bg-white rounded-xl shadow-2xl shadow-gray-900/20 border border-gray-200 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              {vehicleIcons[vehicle.type]}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">{vehicle.name}</h2>
              <p className="text-gray-300 text-sm capitalize">{vehicle.type} • Live Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Current Location</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Latitude</span>
              <span className="font-mono font-medium">{vehicle.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longitude</span>
              <span className="font-mono font-medium">{vehicle.lng.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaTachometerAlt className="text-gray-600 text-sm" />
              <span className="text-xs text-gray-500">Speed</span>
            </div>
            <p className="font-bold text-gray-900">{metrics.speed} <span className="text-xs font-normal text-gray-500">km/h</span></p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaGasPump className="text-gray-600 text-sm" />
              <span className="text-xs text-gray-500">Fuel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-full rounded-full ${metrics.fuelLevel > 25 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${metrics.fuelLevel}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold">{metrics.fuelLevel}%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaBolt className="text-gray-600 text-sm" />
              <span className="text-xs text-gray-500">Battery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${metrics.battery}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold">{metrics.battery}%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaWrench className="text-gray-600 text-sm" />
              <span className="text-xs text-gray-500">Health</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getHealthColor(metrics.health)}`}>
              {metrics.health}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
          <FaClock className="text-gray-400" />
          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={copyLocation}
              className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors group disabled:opacity-70 disabled:cursor-not-allowed"
              title="Copy tracking link"
              disabled={isLoading}
            >
              <FaCopy className="text-gray-700 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-700">Copy</span>
            </button>
            
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all shadow-sm hover:shadow group disabled:opacity-70 disabled:cursor-not-allowed"
              title="Share via WhatsApp"
              disabled={isLoading}
            >
              <FaWhatsapp className="mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
            
            <button
              onClick={openDirections}
              className="flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-sm hover:shadow group disabled:opacity-70 disabled:cursor-not-allowed"
              title="Get directions"
              disabled={isLoading}
            >
              <FaDirections className="mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Navigate</span>
            </button>
          </div>

          {/* Stop Button */}
          <button
            onClick={() => handleStop(vehicle.vehicleId)}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            } text-white py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow disabled:hover:shadow-none`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FaExclamationTriangle />
            )}
            {isLoading ? 'Removing...' : 'Stop Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclePopup;