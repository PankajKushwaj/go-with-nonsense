import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other backend process or set a different PORT in backend/.env.`);
      process.exit(1);
    }

    throw error;
  });
};

if (process.env.NODE_ENV === "production") {
  connectDB({ required: true })
    .then(startServer)
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
} else {
  startServer();
  connectDB({ required: false });
}
