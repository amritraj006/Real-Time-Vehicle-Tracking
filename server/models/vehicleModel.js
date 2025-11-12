import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["car", "bike", "truck", "bus"],
      default: "car",
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    userId: { type: String, ref: "User", required: true }, // Clerk userId
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
