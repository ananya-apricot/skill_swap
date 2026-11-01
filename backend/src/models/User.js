const mongoose = require("mongoose");

const skillEntry = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    description: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    bio: { type: String, maxlength: 500 },
    location: { type: String, trim: true },
    timezone: { type: String },
    preferredMode: { type: String, enum: ["online", "in-person", "both"], default: "online" },
    availability: [{ type: String }], // e.g. "weekday-evenings"

    skillsOffered: [skillEntry],
    skillsWanted: [skillEntry],

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ "skillsOffered.skill": 1 });
userSchema.index({ "skillsWanted.skill": 1 });

module.exports = mongoose.model("User", userSchema);