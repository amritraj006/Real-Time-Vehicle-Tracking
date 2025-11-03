// insert.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "./models/vehicleModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const insertVehicle = async () => {
  try {
    const vehicleId = "V087"; // change ID if you want to add another
    const existing = await Vehicle.findOne({ vehicleId });

    if (existing) {
      console.log(`ℹ️ Vehicle with ID ${vehicleId} already exists.`);
      process.exit(0);
    }

    await Vehicle.create({
      vehicleId,
      name: "Bike 2",
      lat: 30.6139, // sample coordinates
      lng: 27.2090,
    });

    console.log(`✅ Vehicle ${vehicleId} added successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting vehicle:", error);
    process.exit(1);
  }
};

insertVehicle();
