import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-500 mb-4">404</h1>
        <p className="text-2xl text-green-500 mb-8">Page Not Found</p>
        <button
          onClick={() => navigate('/home')}
          className="bg-green-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;