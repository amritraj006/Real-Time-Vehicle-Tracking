/**
 * Vehicle types, styling configurations, color palettes, and SVG icons.
 */
export const VEHICLE_TYPES = {
  CAR: "car",
  BIKE: "bike",
  TRUCK: "truck",
  BUS: "bus",
};

export const vehicleTypeData = {
  car: {
    name: "Car",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    light: "rgba(59, 130, 246, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3076/3076042.png",
    svg: `<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M5 11l2-2h10l2 2v6H5v-6z"/><circle cx="7" cy="16" r="1"/><circle cx="17" cy="16" r="1"/></svg>`,
  },
  bike: {
    name: "Bike",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #F87171)",
    light: "rgba(239, 68, 68, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    svg: `<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 2l3 3h-2v2h2l-3 3-3-3h2V5H9l3-3z"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/><path d="M7 13v-2h10v2H7z"/></svg>`,
  },
  truck: {
    name: "Truck",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    light: "rgba(245, 158, 11, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1630/1630288.png",
    svg: `<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M3 7h18v10H3V7z"/><path d="M3 7l2-4h14l2 4"/><circle cx="7" cy="16" r="1"/><circle cx="17" cy="16" r="1"/></svg>`,
  },
  bus: {
    name: "Bus",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    light: "rgba(16, 185, 129, 0.1)",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2819/2819107.png",
    svg: `<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M3 7h18v10H3V7z"/><path d="M3 7l2-4h14l2 4"/><circle cx="7" cy="16" r="1"/><circle cx="17" cy="16" r="1"/><path d="M7 11h2v2H7v-2z"/><path d="M11 11h2v2h-2v-2z"/><path d="M15 11h2v2h-2v-2z"/></svg>`,
  },
};

/**
 * Returns the hex route polyline color for a vehicle type.
 * @param {string} type
 */
export const getRouteColor = (type) => {
  return vehicleTypeData[type]?.color || "#10B981";
};
