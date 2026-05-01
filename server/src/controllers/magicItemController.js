import MagicItem from "../models/MagicItem.js";

/**
 * GET /api/v1/magic-items
 * Filters:
 * ?type=Spell|Potion
 * ?rarity=Common|Rare|Epic|Legendary|Wow
 * ?status=Unlearned|Learned|Unbrewed|Brewed
 * ?minPower=1&maxPower=100
 */
export const getMagicItems = async (req, res, next) => {
  try {
    const { type, rarity, status, minPower, maxPower } = req.query;
    const query = {};

    if (type) query.type = type;
    if (rarity) query.rarity = rarity;
    if (status) query.status = status;

    if (minPower || maxPower) {
      query.power = {};
      if (minPower) query.power.$gte = Number(minPower);
      if (maxPower) query.power.$lte = Number(maxPower);
    }

    const items = await MagicItem.find(query).sort({ createdAt: -1 });
    res.json({ count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

export const getMagicItemById = async (req, res, next) => {
  try {
    const item = await MagicItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Magic item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const createMagicItem = async (req, res, next) => {
  try {
    const created = await MagicItem.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateMagicItem = async (req, res, next) => {
  try {
    const updated = await MagicItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Magic item not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteMagicItem = async (req, res, next) => {
  try {
    const deleted = await MagicItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Magic item not found" });
    res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (err) {
    next(err);
  }
};

/** BONUS: PATCH /api/v1/magic-items/:id/toggle-status */
export const toggleStatus = async (req, res, next) => {
  try {
    const item = await MagicItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Magic item not found" });

    if (item.type === "Spell") {
      item.status = item.status === "Unlearned" ? "Learned" : "Unlearned";
    } else {
      item.status = item.status === "Unbrewed" ? "Brewed" : "Unbrewed";
    }

    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/** BONUS: PATCH /api/v1/magic-items/:id/power-up */
export const powerUp = async (req, res, next) => {
  try {
    const item = await MagicItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Magic item not found" });

    item.power = Math.min(100, item.power + 5);
    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
};
