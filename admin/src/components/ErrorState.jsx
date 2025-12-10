import React from "react";
import { Shield } from "lucide-react";

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;