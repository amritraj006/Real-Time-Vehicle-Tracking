import React from "react";
import { X } from "lucide-react";

const AddVehicleForm = ({
  newVehicle,
  setNewVehicle,
  handleSubmit,
  setOpen,
}) => {
  return (
    <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-2xl z-[1200] flex flex-col pointer-events-none">
      <div className="p-6 flex-1 pointer-events-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Your Vehicle</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Vehicle Name"
            value={newVehicle.name}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, name: e.target.value })
            }
            className="border p-2 rounded"
          />

          <select
            value={newVehicle.type}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, type: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="truck">Truck</option>
            <option value="bus">Bus</option>
          </select>

          <div className="text-sm text-gray-600">
            Click on the map to set location:
            <br />
            <span className="font-medium text-black">
              {newVehicle.lat && newVehicle.lng
                ? `Lat: ${newVehicle.lat.toFixed(4)}, Lng: ${newVehicle.lng.toFixed(4)}`
                : "No location selected"}
            </span>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Save Vehicle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;
