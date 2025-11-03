import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleId: String,
  name: String,
  lat: Number,
  lng: Number,
  updatedAt: Date,
});

export default mongoose.model("Vehicle", vehicleSchema);
