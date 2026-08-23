// config/db.js
// --------------------------------------------------
// MongoDB connection using Mongoose.
// Called once at startup in app.js.
// --------------------------------------------------

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Exit if DB can't connect — app can't function without it
  }
};

export default connectDB;
