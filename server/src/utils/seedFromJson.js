import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import MagicItem from "../models/MagicItem.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, "../../data/magic-items.json");

const seed = async () => {
  await connectDB();

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const items = JSON.parse(raw);

  await MagicItem.deleteMany({});
  await MagicItem.insertMany(items);

  console.log(`Seed completed: inserted ${items.length} items`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
