import { X, Loader2 } from "lucide-react";

const AddVehicleForm = ({
  newVehicle,
  setNewVehicle,
  handleSubmit,
  setOpen,
  isLoading
}) => {
  return (
    <div className="absolute top-0 right-0 h-full w-[380px] bg-gradient-to-b from-gray-50 to-white shadow-2xl shadow-gray-900/20 z-[1200] flex flex-col border-l border-gray-200">
      <div className="p-7 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Vehicle</h2>
            <p className="text-sm text-gray-500 mt-1">Register a new vehicle to the fleet</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close form"
            disabled={isLoading}
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Name
            </label>
            <input
              type="text"
              placeholder="e.g., Delivery Van #1"
              value={newVehicle.name}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <select
              value={newVehicle.type}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, type: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none bg-white disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">
                Set Location on Map
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Click anywhere on the map to set the vehicle's location
            </p>
            {newVehicle.lat && newVehicle.lng ? (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-medium text-gray-900">
                    {newVehicle.lat.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-medium text-gray-900">
                    {newVehicle.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <span className="text-sm text-gray-500 font-medium">
                  No location selected
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!newVehicle.lat || !newVehicle.lng || isLoading}
              className="w-full bg-green-600 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding Vehicle...
                </>
              ) : (
                'Save Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;