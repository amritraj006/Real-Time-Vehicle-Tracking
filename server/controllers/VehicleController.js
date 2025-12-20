// Correct import with exact filename
import Vehicle from "../models/VehicleModel.js";
import User from "../models/UserModel.js"


export const getActiveVehicles = async (req, res) => {
  try {
    const TEN_SECONDS = 10000;
    const sinceTime = new Date(Date.now() - TEN_SECONDS);

    const activeVehicles = await Vehicle.find({
  updatedAt: { $gte: sinceTime }
}).select("vehicleId name type lat lng route updatedAt"); // ✅ route added


    res.json({ vehicles: activeVehicles });   // FIXED 🔥🔥
  } catch (error) {
    console.error("Error fetching active vehicles:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// ✅ Add new vehicle
export const addVehicle = async (req, res) => {
  try {
    const { vehicleId, name, type, lat, lng, userId } = req.body;

    if (!vehicleId || !name || !lat || !lng || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ vehicleId });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle already exists" });
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
  vehicleId,
  name,
  type,
  lat,
  lng,
  userId,
  route: [{ lat, lng }], // ✅ start route from initial point
});


    // Save ONLY vehicle name to user's vehicles list
    await User.findByIdAndUpdate(
      userId,
      { $push: { vehicles: vehicle.name } },
      { new: true }
    );

    return res.status(201).json(vehicle);

  } catch (error) {
    console.error("❌ Error adding vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get all vehicles for a specific user
export const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const vehicles = await Vehicle.find({ userId })
      .select("vehicleId name type lat lng route"); // ✅ route added

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Delete specific vehicle by vehicleId and userId
export const deleteVehicle = async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;

    const vehicle = await Vehicle.findOneAndDelete({
      userId: userId,
      vehicleId: vehicleId,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findOne({ vehicleId });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


