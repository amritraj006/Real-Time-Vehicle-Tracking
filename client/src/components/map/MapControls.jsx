import React, { useState } from "react";
import {
  Maximize,
  Minimize,
  Navigation,
  Expand,
} from "lucide-react";

export const MAP_LAYERS = [
  {
    id: "satellite",
    name: "Satellite Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
    badge: "Satellite",
    previewBg: "bg-emerald-900 border-emerald-400",
  },
];

/**
 * Floating map tools.
 * Configured exclusively for high-resolution Satellite Imagery.
 */
const MapControls = ({
  onFitBounds,
  onLocateMe,
  vehicleCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="absolute top-20 right-4 z-[900] flex flex-col gap-2.5 items-end">
      {/* Map Tools Card */}
      <div className="relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-1.5 flex flex-col gap-1">
          {/* Fit all vehicles in view */}
          <button
            onClick={onFitBounds}
            disabled={vehicleCount === 0}
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title="Fit all fleet units to view"
          >
            <Expand size={18} />
          </button>

          {/* Locate Me GPS */}
          <button
            onClick={onLocateMe}
            className="p-2.5 rounded-xl text-green-600 hover:bg-green-50 transition-all cursor-pointer flex items-center justify-center"
            title="Locate my position on map"
          >
            <Navigation size={18} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapControls;
