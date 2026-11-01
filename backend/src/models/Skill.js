const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, trim: true }, // e.g. Programming, Music, Language
    aliases: [{ type: String, lowercase: true, trim: true }], // "reactjs", "react.js"
  },
  { timestamps: true }
);

skillSchema.index({ name: "text", aliases: "text" });

module.exports = mongoose.model("Skill", skillSchema);