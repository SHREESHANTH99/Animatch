import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let MONGODB_URI = process.env.MONGODB_URI;

// Ensure database name is included
if (
  MONGODB_URI &&
  !MONGODB_URI.includes("?") &&
  !MONGODB_URI.endsWith("/animatch")
) {
  MONGODB_URI = MONGODB_URI.trim() + "/animatch";
}

console.log("Testing MongoDB connection...");
console.log("URI structure:", MONGODB_URI ? "mongodb+srv://****" : "Not found");

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  });
