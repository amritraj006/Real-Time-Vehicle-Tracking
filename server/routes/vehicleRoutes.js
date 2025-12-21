import express from "express";
import {
  addVehicle,
  getVehiclesByUser,
  deleteVehicle,
  getVehicleById,
  getActiveVehicles 
} from "../controllers/vehicleController.js"


const router = express.Router();

router.get("/active", getActiveVehicles); // Get active vehicles
router.post("/add", addVehicle);           // Add new vehicle
router.get("/:userId", getVehiclesByUser); // Get vehicles by userId
router.delete("/:userId/:vehicleId", deleteVehicle); // Delete vehicle
router.get("/track/:vehicleId", getVehicleById); 


export default router;
