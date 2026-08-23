// routes/vehicleRoutes.js
// --------------------------------------------------
// Maps vehicle API endpoints to their controllers.
// No logic here — only URL + HTTP method bindings.
// --------------------------------------------------

import express from "express";
import {
  getActiveVehicles,
  getVehiclesByUser,
  getVehicleById,
  addVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/active",              getActiveVehicles);    // GET  /api/vehicles/active
router.post("/add",                addVehicle);           // POST /api/vehicles/add
router.get("/track/:vehicleId",    getVehicleById);       // GET  /api/vehicles/track/:vehicleId
router.get("/:userId",             getVehiclesByUser);    // GET  /api/vehicles/:userId
router.delete("/:userId/:vehicleId", deleteVehicle);      // DEL  /api/vehicles/:userId/:vehicleId

export default router;
