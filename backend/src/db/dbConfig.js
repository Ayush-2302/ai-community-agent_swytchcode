import mongoose from "mongoose";
import dns from "dns";
import config from "../config/env.js";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if unsupported
}

const uri = config.database.uri;

const connectToMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4, // Force IPv4
    });
    console.log("Connected to MongoDB successfully", conn.connection.host);
    return true;
  } catch (error) {
    console.warn("MongoDB Atlas connection warning:", error.message);
    return false;
  }
};

mongoose.connection.on("connected", () => console.log("[Mongoose] Status: Connected (1)"));
mongoose.connection.on("disconnected", () => console.warn("[Mongoose] Status: Disconnected (0)"));
mongoose.connection.on("error", (err) => console.error("[Mongoose] Error:", err.message));

export default connectToMongoDB;
