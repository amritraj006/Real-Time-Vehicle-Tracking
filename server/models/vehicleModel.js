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

    // Clerk userId (matches User._id)
    userId: { type: String, ref: "User", required: true },

    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
