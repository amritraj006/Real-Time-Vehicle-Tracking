import React from "react";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaWhatsapp,
  FaCopy,
  FaShareAlt,
  FaDirections,
  FaExclamationTriangle,
  FaInstagram,
  FaBatteryThreeQuarters,
} from "react-icons/fa";

const vehicleIcons = {
  car: <FaCar className="text-blue-500 text-xl" />,
  bike: <FaMotorcycle className="text-red-500 text-xl" />,
  truck: <FaTruck className="text-orange-500 text-xl" />,
  bus: <FaBus className="text-green-500 text-xl" />,
};

const VehiclePopup = ({ vehicle, handleStop }) => {
  const shareURL = `https://www.google.com/maps?q=${vehicle.lat},${vehicle.lng}`;
  const shareText = `🚗 *${vehicle.name}* 
Type: ${vehicle.type}
Location: ${shareURL}`;

  // WhatsApp share
  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  // Instagram share (Instagram does not allow direct share URLs)
  const shareInstagram = () => {
    alert("Instagram does not allow direct location sharing. Copying link.");
    navigator.clipboard.writeText(shareURL);
  };

  // Copy location
  const copyLocation = () => {
    navigator.clipboard.writeText(shareURL);
    alert("Location copied to clipboard!");
  };

  // Open Google Maps navigation
  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${vehicle.lat},${vehicle.lng}`, "_blank");
  };

  // Dummy additional vehicle data
  const fuelLevel = Math.floor(Math.random() * 50) + 50; // 50%–100%
  const battery = Math.floor(Math.random() * 40) + 60; // 60%–100%
  const speed = Math.floor(Math.random() * 60) + 20; // 20–80 km/h
  const health = ["Good", "Moderate", "Low"][Math.floor(Math.random() * 3)];

  return (
    <div className="p-2 w-[220px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        {vehicleIcons[vehicle.type]}
        <h2 className="font-bold text-base">{vehicle.name}</h2>
      </div>

      {/* Status */}
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
        🟢 Online — Running
      </span>

      {/* Additional Info */}
      <div className="mt-2 text-sm space-y-1">
        <p><b>Type:</b> {vehicle.type}</p>
        <p><b>Lat:</b> {vehicle.lat.toFixed(4)}</p>
        <p><b>Lng:</b> {vehicle.lng.toFixed(4)}</p>
        <p><b>Speed:</b> {speed} km/h</p>
        <p><b>Fuel:</b> {fuelLevel}%</p>
        <p><b>Battery:</b> {battery}%</p>
        <p><b>Health:</b> {health}</p>
        <p><b>Updated:</b> {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={copyLocation}
          className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-800 rounded px-2 py-1"
        >
          <FaCopy size={12} /> Copy
        </button>

        <button
          onClick={shareWhatsApp}
          className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded px-2 py-1"
        >
          <FaWhatsapp size={14} /> WhatsApp
        </button>

        <button
          onClick={shareInstagram}
          className="flex-1 flex items-center justify-center gap-1 bg-pink-500 text-white rounded px-2 py-1"
        >
          <FaInstagram size={14} /> Instagram
        </button>

        <button
          onClick={openDirections}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white rounded px-2 py-1"
        >
          <FaDirections size={14} /> Navigate
        </button>
      </div>

      {/* SOS Alert */}
      <button className="mt-2 w-full bg-yellow-500 text-white py-1 rounded flex items-center justify-center gap-1">
        <FaExclamationTriangle /> SOS Alert
      </button>

      {/* Stop Vehicle */}
      <button
        className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
        onClick={() => handleStop(vehicle.vehicleId)}
      >
        Stop Vehicle
      </button>
    </div>
  );
};

export default VehiclePopup;
