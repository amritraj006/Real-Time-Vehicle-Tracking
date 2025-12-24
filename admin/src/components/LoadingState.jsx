import React from "react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-green-500 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;