import React from "react";

/**
 * Loader component.
 * - Default: full-screen centered spinner (used as Suspense fallback / page loader).
 * - mini prop: small inline spinner for use inside buttons or tight UI areas.
 */
const Loader = ({ mini = false }) => {
  if (mini) {
    return (
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white gap-5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-2">
        <img src="/favicon.svg" alt="Logo" className="h-10 w-10" />
        <span className="text-2xl font-bold text-gray-800 tracking-tight">
          TrackVehicle
        </span>
      </div>

      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>

      {/* Loading text */}
      <p className="text-gray-500 text-sm font-medium animate-pulse tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
};

export default Loader;
