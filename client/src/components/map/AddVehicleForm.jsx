import React, { useState } from "react";
import { X, Navigation, Car, Bike, Truck, Bus, Check } from "lucide-react";
import Loader from "../common/Loader";

// Quick presets for fast vehicle testing and realistic coordinate placement
const QUICK_PRESETS = [
  { name: "New Delhi Center", lat: 28.6139, lng: 77.2090 },
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Gurugram Cyber Hub", lat: 28.4950, lng: 77.0895 },
  { name: "Noida Sector 18", lat: 28.5708, lng: 77.3260 },
  { name: "Mumbai Marine Drive", lat: 18.9438, lng: 72.8234 },
  { name: "Bengaluru Tech Park", lat: 12.9716, lng: 77.5946 },
];

const vehicleTypes = [
  { id: "car", label: "Car / Sedan", icon: Car, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "bike", label: "Motorcycle", icon: Bike, color: "text-red-600 bg-red-50 border-red-200" },
  { id: "truck", label: "Heavy Truck", icon: Truck, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "bus", label: "Transit Bus", icon: Bus, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

/**
 * Slide-over drawer form for registering a new vehicle.
 * Styled in clean light aesthetic.
 */
const AddVehicleForm = ({
  newVehicle,
  setNewVehicle,
  handleSubmit,
  setOpen,
  isLoading,
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewVehicle((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setGpsLoading(false);
        alert("Could not retrieve GPS location. Please allow location permissions or click on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in">
      {/* Backdrop overlay dismiss for mobile */}
      <div className="absolute inset-0" onClick={() => !isLoading && setOpen(false)} />

      {/* Drawer Container */}
      <div className="relative w-full sm:max-w-md bg-white h-full max-h-screen overflow-y-auto shadow-2xl flex flex-col border-l border-slate-200 z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-slate-100 flex justify-between items-center z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-green-600 rounded-xl text-white shadow-xs">
                <Navigation size={18} />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Add Vehicle</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deploy a new vehicle to the live tracking grid
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            aria-label="Close form"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Vehicle Name / Unit ID
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Express #104"
                value={newVehicle.name}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:border-green-500 transition-all outline-none text-sm font-medium"
                required
                disabled={isLoading}
              />
            </div>

            {/* Vehicle Type Visual Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {vehicleTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = newVehicle.type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewVehicle({ ...newVehicle, type: t.id })}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-green-600 bg-green-50/50 shadow-xs ring-2 ring-green-600/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${t.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{t.label}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{t.id} profile</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting Coordinates */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spawn Coordinates (Lat, Lng)
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gpsLoading || isLoading}
                  className="text-[11px] font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Navigation size={12} className={gpsLoading ? "animate-spin" : ""} />
                  {gpsLoading ? "Locating..." : "Use My GPS"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g. 28.6139)"
                    value={newVehicle.lat ?? ""}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        lat: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:border-green-500 outline-none text-xs font-mono"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g. 77.2090)"
                    value={newVehicle.lng ?? ""}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        lng: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:border-green-500 outline-none text-xs font-mono"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                  Or pick a quick hub preset:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setNewVehicle({ ...newVehicle, lat: p.lat, lng: p.lng })
                      }
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-medium border border-slate-200 text-left truncate transition-colors cursor-pointer"
                    >
                      📍 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader size={16} />
                ) : (
                  <>
                    <Check size={16} />
                    <span>Deploy Vehicle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleForm;