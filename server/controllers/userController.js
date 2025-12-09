import User from "../models/UserModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-__v").sort({ createdAt: -1 }); // Exclude __v, newest first
    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
