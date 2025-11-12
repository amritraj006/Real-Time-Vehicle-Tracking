import express from "express";
import { addVehicle, getVehiclesByUser } from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/add", addVehicle);           // Add new vehicle
router.get("/:userId", getVehiclesByUser); // Get vehicles by userId

export default router;
