import dns from "node:dns";
import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

const configureMongoDns = () => {
  if (!process.env.MONGO_DNS_SERVERS) return;

  const servers = process.env.MONGO_DNS_SERVERS.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length) {
    dns.setServers(servers);
  }
};

const connectDB = async ({ required = process.env.NODE_ENV === "production" } = {}) => {
  configureMongoDns();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    const message = "MONGO_URI is not configured. API routes that use MongoDB will return errors until it is set.";
    if (required) {
      throw new Error(message);
    }

    console.warn(message);
    return null;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    if (required) {
      throw error;
    }

    console.warn(`MongoDB connection skipped: ${error.message}`);
    return null;
  }
};

export default connectDB;
