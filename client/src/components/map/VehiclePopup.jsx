import React from "react";

const VehiclePopup = ({ vehicle, handleStop }) => {
  return (
    <div>
      <b>{vehicle.name}</b>
      <br />
      Type: {vehicle.type}
      <br />
      Lat: {vehicle.lat.toFixed(4)}
      <br />
      Lng: {vehicle.lng.toFixed(4)}
      <br />
      <button
        className="mt-1 px-2 py-1 bg-red-500 text-white rounded"
        onClick={() => handleStop(vehicle.vehicleId)}
      >
        Stop
      </button>
    </div>
  );
};

export default VehiclePopup;
