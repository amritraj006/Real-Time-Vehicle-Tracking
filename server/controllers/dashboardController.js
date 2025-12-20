import User from "../models/UserModel.js";
import Vehicle from "../models/VehicleModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Total users
    const totalUsers = await User.countDocuments();

    // 2️⃣ Total vehicles added ever (sum of all user vehicles)
    const users = await User.find({}, "vehicles");
    const totalVehiclesAdded = users.reduce((sum, user) => {
      return sum + (user.vehicles?.length || 0);
    }, 0);

    // 3️⃣ Active vehicles = updated within last 10 seconds
    const TEN_SECONDS = 1000 * 10;
    const endTime = new Date(Date.now() - TEN_SECONDS);

    const activeVehicles = await Vehicle.countDocuments({
      updatedAt: { $gte: endTime }
    });

    // 4️⃣ Total vehicles in database (tracking vehicles)
    const totalTrackedVehicles = await Vehicle.countDocuments();

    res.json({
      totalUsers,
      totalVehiclesAdded,
      totalTrackedVehicles,
      activeVehicles
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
