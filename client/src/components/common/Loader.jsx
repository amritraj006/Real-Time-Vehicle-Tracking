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
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
