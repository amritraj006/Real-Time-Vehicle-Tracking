import L from "leaflet";
import { vehicleTypeData } from "../constants/vehicleConfig";

// Fix Leaflet default marker icons for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("../../node_modules/leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("../../node_modules/leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

/**
 * Calculates bearing angle (in degrees) between two coordinate points
 */
export const calculateBearing = (startLat, startLng, destLat, destLng) => {
  if (!startLat || !startLng || !destLat || !destLng) return 0;
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
};

/**
 * Creates custom pulsing marker DivIcon for the fleet MapView with heading orientation.
 * @param {Object} vehicle - { name, type, speed, heading, status }
 * @param {boolean} isSelected - whether this vehicle is currently active/focused
 */
export const getVehicleDivIcon = (vehicle, isSelected = false) => {
  const config = vehicleTypeData[vehicle.type] || vehicleTypeData.car;
  const { color, gradient, svg } = config;
  const heading = vehicle.heading || 0;
  const isMoving = (vehicle.speed || 0) > 2;

  return L.divIcon({
    html: `
      <div class="vehicle-marker-wrapper ${isSelected ? "is-selected" : ""} ${isMoving ? "is-moving" : "is-idle"}">
        <!-- Pulse ring on movement or selection -->
        <div class="vehicle-pulse-ring" style="border-color: ${color}; background: ${color}20"></div>
        
        <!-- Heading Direction Indicator Arrow -->
        <div class="vehicle-heading-arrow" style="transform: rotate(${heading}deg);">
          <div class="arrow-tip" style="border-bottom-color: ${color}"></div>
        </div>

        <!-- Main Vehicle Bubble Icon -->
        <div class="vehicle-bubble" style="background: ${gradient}; box-shadow: 0 4px 18px ${color}60;">
          <div class="vehicle-icon-svg">${svg}</div>
          <div class="vehicle-status-dot ${isMoving ? "bg-emerald-400" : "bg-amber-400"}"></div>
        </div>

        <!-- Vehicle Label & Speed Badge -->
        <div class="vehicle-label-chip">
          <span class="vehicle-name-text">${vehicle.name}</span>
          ${vehicle.speed !== undefined ? `<span class="vehicle-speed-tag" style="background:${color}25; color:${color}">${Math.round(vehicle.speed)} km/h</span>` : ""}
        </div>
      </div>
    `,
    className: "custom-vehicle-icon",
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -42],
  });
};

/**
 * Preview marker icon for new vehicle location placement.
 */
export const previewMarkerIcon = L.divIcon({
  html: `
    <div class="preview-marker">
      <div class="preview-pulse"></div>
      <div class="preview-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <div class="preview-badge">Click map to set</div>
    </div>
  `,
  className: "preview-vehicle-icon",
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

/**
 * User GPS location marker
 */
export const userLocationIcon = L.divIcon({
  html: `
    <div class="user-gps-marker">
      <div class="user-gps-pulse"></div>
      <div class="user-gps-dot"></div>
    </div>
  `,
  className: "user-location-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/**
 * Creates enhanced glowing multi-ring marker DivIcon for single vehicle tracking (Lander).
 * @param {string} type - 'car' | 'bike' | 'truck' | 'bus'
 */
export const getEnhancedVehicleDivIcon = (type) => {
  const config = vehicleTypeData[type] || vehicleTypeData.car;

  return L.divIcon({
    html: `
      <div class="enhanced-marker-container">
        <div class="marker-outer-ring" style="background: ${config.color}"></div>
        <div class="marker-middle-ring" style="background: ${config.color}"></div>
        <div class="marker-inner-glow" style="background: ${config.gradient}"></div>
        <div class="marker-main" style="background: ${config.gradient}">
          <img src="${config.iconUrl}" alt="${config.name}"/>
        </div>
        <div class="live-indicator">
          <div class="pulse-dot"></div>
        </div>
      </div>
    `,
    className: "enhanced-vehicle-icon",
    iconSize: [65, 65],
    iconAnchor: [32.5, 65],
    popupAnchor: [0, -65],
  });
};

