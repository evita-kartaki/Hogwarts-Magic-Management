import express from "express";
import {
  getMagicItems,
  getMagicItemById,
  createMagicItem,
  updateMagicItem,
  deleteMagicItem,
  toggleStatus,
  powerUp,
} from "../controllers/magicItemController.js";

const router = express.Router();

router.get("/", getMagicItems);
router.get("/:id", getMagicItemById);
router.post("/", createMagicItem);
router.put("/:id", updateMagicItem);
router.delete("/:id", deleteMagicItem);

// Bonus routes (ταιριάζουν με το UI σου)
router.patch("/:id/toggle-status", toggleStatus);
router.patch("/:id/power-up", powerUp);

export default router;
