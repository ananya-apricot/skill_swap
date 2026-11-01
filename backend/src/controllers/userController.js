const { z } = require("zod");
const User = require("../models/User");
const Skill = require("../models/Skill");

// A MongoDB id is a 24-character hex string
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid skill id");

const skillEntrySchema = z.object({
  skill: objectId,
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  description: z.string().max(300).optional(),
});

// Every field is optional, so users can update just one thing at a time
const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().max(60).optional(),
  preferredMode: z.enum(["online", "in-person", "both"]).optional(),
  availability: z.array(z.string().max(40)).max(14).optional(),
  skillsOffered: z.array(skillEntrySchema).max(15).optional(),
  skillsWanted: z.array(skillEntrySchema).max(15).optional(),
});

// Fills skill ids with real skill info (only name and category)
const populateSkills = (query) =>
  query
    .populate("skillsOffered.skill", "name category")
    .populate("skillsWanted.skill", "name category");

// Checks the skill list has no repeats and every id really exists
const checkSkills = async (entries) => {
  const ids = entries.map((e) => e.skill);
  if (new Set(ids).size !== ids.length) return "A skill is listed more than once";

  const found = await Skill.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) return "One or more skills do not exist";

  return null; // null means "no problem"
};

// GET /api/users/me
const getMyProfile = async (req, res, next) => {
  try {
    const user = await populateSkills(User.findById(req.user._id));
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me
const updateMyProfile = async (req, res, next) => {
  try {
    const data = req.body;

    for (const key of ["skillsOffered", "skillsWanted"]) {
      if (data[key]) {
        const problem = await checkSkills(data[key]);
        if (problem) return res.status(400).json({ message: `${key}: ${problem}` });
      }
    }

    // You can't teach and want to learn the same skill
    const offered = (data.skillsOffered || req.user.skillsOffered).map((e) => String(e.skill));
    const wanted = (data.skillsWanted || req.user.skillsWanted).map((e) => String(e.skill));
    if (offered.some((id) => wanted.includes(id))) {
      return res.status(400).json({ message: "A skill can't be both offered and wanted" });
    }

    // $set updates only the fields we send. runValidators re-checks the model rules.
    const user = await populateSkills(
      User.findByIdAndUpdate(req.user._id, { $set: data }, { new: true, runValidators: true })
    );

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id  (public view)
const getPublicProfile = async (req, res, next) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // The second argument lists ONLY the fields we're willing to show
    const user = await populateSkills(
      User.findOne(
        { _id: req.params.id, isBanned: false },
        "name bio location timezone preferredMode availability skillsOffered skillsWanted ratingAvg ratingCount createdAt"
      )
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, updateMyProfile, getPublicProfile, updateProfileSchema };