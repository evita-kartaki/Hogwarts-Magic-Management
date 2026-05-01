import mongoose from "mongoose";

const STATUS_SPELL = ["Unlearned", "Learned"];
const STATUS_POTION = ["Unbrewed", "Brewed"];

const magicItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, enum: ["Spell", "Potion"] },
    element: { type: String, required: true, trim: true },
    power: { type: Number, required: true, min: 1, max: 100 },
    rarity: {
      type: String,
      required: true,
      enum: ["Common", "Rare", "Epic", "Legendary", "Wow"],
    },
    description: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

magicItemSchema.pre("validate", function (next) {
  if (this.type === "Spell" && !STATUS_SPELL.includes(this.status)) {
    return next(new Error(`Status for Spell must be: ${STATUS_SPELL.join(", ")}`));
  }
  if (this.type === "Potion" && !STATUS_POTION.includes(this.status)) {
    return next(new Error(`Status for Potion must be: ${STATUS_POTION.join(", ")}`));
  }
  next();
});

export default mongoose.model("MagicItem", magicItemSchema);
