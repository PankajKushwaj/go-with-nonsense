import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sampleProducts from "../data/sampleProducts.js";

dotenv.config();

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed the database");
  }

  await connectDB({ required: true });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gowithnonsense.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const admin = await User.findOne({ email: adminEmail });

  if (admin) {
    admin.name = process.env.ADMIN_NAME || "Go with Nonsense Admin";
    admin.password = adminPassword;
    admin.role = "admin";
    await admin.save();
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || "Go with Nonsense Admin",
      email: adminEmail,
      role: "admin",
      password: adminPassword
    });
  }

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);

  console.log("Seed complete");
  console.log(`Admin email: ${adminEmail}`);
  console.log("Admin password set from ADMIN_PASSWORD in .env");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
