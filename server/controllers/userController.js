// controllers/userController.js
// --------------------------------------------------
// Thin HTTP layer for user-related endpoints.
// All business logic lives in user.service.js.
// --------------------------------------------------

import * as userService from "../services/user.service.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
