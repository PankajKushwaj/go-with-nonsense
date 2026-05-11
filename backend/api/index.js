import app from "../src/app.js";
import connectDB from "../src/config/db.js";

connectDB({ required: false });

export default app;
