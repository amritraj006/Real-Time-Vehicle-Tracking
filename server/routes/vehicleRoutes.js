import express from "express";
import { addVehicle, getVehiclesByUser } from '../controllers/vehicleController.js'
import { deleteVehicle } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/add", addVehicle);           // Add new vehicle
router.get("/:userId", getVehiclesByUser); // Get vehicles by userId
router.delete("/:userId/:vehicleId", deleteVehicle); // Delete vehicle

export default router;
