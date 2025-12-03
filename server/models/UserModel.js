import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk userId
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },

    // 👉 Stores ALL vehicles EVER added by the user
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      }
    ],
  },
  { timestamps: true }
);

// Prevent model overwrite in dev
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
