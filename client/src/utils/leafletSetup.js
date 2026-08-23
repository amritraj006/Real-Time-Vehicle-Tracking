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
 * Creates custom pulsing marker DivIcon for the fleet MapView.
 * @param {Object} vehicle - { name, type }
 */
export const getVehicleDivIcon = (vehicle) => {
  const config = vehicleTypeData[vehicle.type] || vehicleTypeData.car;
  const { color, gradient, svg } = config;

  return L.divIcon({
    html: `
      <div class="vehicle-marker-container">
        <div class="vehicle-pulse" style="background: ${color}"></div>
        <div class="vehicle-icon" style="background: ${gradient}">
          ${svg}
        </div>
        <div class="vehicle-label">
          ${vehicle.name}
        </div>
      </div>
    `,
    className: "custom-vehicle-icon",
    iconSize: [70, 70],
    iconAnchor: [35, 70],
    popupAnchor: [0, -70],
  });
};

/**
 * Preview marker icon for new vehicle location placement.
 */
export const previewMarkerIcon = L.divIcon({
  html: `
    <div class="preview-marker">
      <div class="preview-pulse"></div>
      <div class="preview-icon"></div>
    </div>
  `,
  className: "preview-vehicle-icon",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
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
