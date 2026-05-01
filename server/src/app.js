import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db.js";
import magicItemRoutes from "./routes/magicItemRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("Hogwarts Magic Management API ✅"));

app.use("/api/v1/magic-items", magicItemRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
