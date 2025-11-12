import Vehicle from "../models/vehicleModel.js";

// ✅ Add new vehicle
export const addVehicle = async (req, res) => {
  try {
    const { vehicleId, name, type, lat, lng, userId } = req.body;

    if (!vehicleId || !name || !lat || !lng || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingVehicle = await Vehicle.findOne({ vehicleId });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle already exists" });
    }

    const vehicle = await Vehicle.create({
      vehicleId,
      name,
      type,
      lat,
      lng,
      userId,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("❌ Error adding vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all vehicles for a specific user
export const getVehiclesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const vehicles = await Vehicle.find({ userId });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({ message: "Server error" });
  }
};
