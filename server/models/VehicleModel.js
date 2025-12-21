import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["car", "bike", "truck", "bus"],
      default: "car",
    },

    // current position
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    // route history
    route: [locationSchema],

    userId: { type: String, ref: "User", required: true },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
