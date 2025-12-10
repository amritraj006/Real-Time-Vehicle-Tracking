import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Truck, Navigation } from "lucide-react";

// ------------------ LEAFLET ICON FIX ------------------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapDashboard = ({ vehicles, mapLoading }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Vehicle Tracking</h1>
        <p className="text-gray-600 mt-1">Real-time location of all active vehicles</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex-1">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Active Vehicles: {vehicles.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Last Updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>Center: India (20.5937°N, 78.9629°E)</span>
          </div>
        </div>

        <div className="h-[calc(100%-72px)]">
          {mapLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading map data...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              className="rounded-b-2xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {vehicles.map((v) => {
                const lat = Number(v.lat);
                const lng = Number(v.lng);
                if (!isFinite(lat) || !isFinite(lng)) return null;

                const key = v.vehicleId ?? v._id ?? `${lat}-${lng}`;

                return (
                  <Marker key={key} position={[lat, lng]}>
                    <Tooltip 
                      direction="top" 
                      offset={[0, -10]} 
                      opacity={1} 
                      permanent
                      className="font-semibold border-0 bg-gray-900 text-white px-3 py-1 rounded-lg shadow-lg"
                    >
                      {v.name}
                    </Tooltip>

                    <Popup className="rounded-xl shadow-xl">
                      <div className="p-3 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{v.name}</p>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {v.type || "Unknown type"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Coordinates:</span>
                            <span className="font-mono text-gray-900">
                              {lat.toFixed(4)}, {lng.toFixed(4)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Last Update:</span>
                            <span className="font-medium text-gray-900">
                              {v.updatedAt
                                ? new Date(v.updatedAt).toLocaleTimeString()
                                : "—"}
                            </span>
                          </div>
                          
                          {v.userId && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">User ID:</span>
                              <span className="font-mono text-xs text-gray-900">{v.userId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;