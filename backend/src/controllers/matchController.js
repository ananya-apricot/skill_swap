const User = require("../models/User");
const { scoreCandidates, basicScore } = require("../services/aiService");

const populate = (q) =>
  q.populate("skillsOffered.skill", "name").populate("skillsWanted.skill", "name");

// Turns a user into the simple shape the AI service expects
const toPerson = (u) => ({
  id: String(u._id),
  offered: u.skillsOffered.map((e) => e.skill.name),
  wanted: u.skillsWanted.map((e) => e.skill.name),
});

const getMatches = async (req, res, next) => {
  try {
    const me = await populate(User.findById(req.user._id));
    if (!me.skillsWanted.length) {
      return res.status(400).json({ message: "Add at least one skill you want to learn" });
    }

    // Shortlist: anyone who offers at least one skill (max 20).
    // The AI does the real ranking, so we no longer require an exact skill match here.
    const candidates = await populate(
      User.find(
        { _id: { $ne: me._id }, isBanned: false, "skillsOffered.0": { $exists: true } },
        "name bio location preferredMode skillsOffered skillsWanted ratingAvg"
      ).limit(20)
    );
    if (!candidates.length) return res.json({ matches: [], source: "none" });

    const meP = toPerson(me);
    const candP = candidates.map(toPerson);

    let results, source;
    try {
      results = await scoreCandidates(meP, candP);
      source = "ai";
    } catch (err) {
      console.warn("AI service unavailable, using basic matching:", err.message);
      results = candP.map((c) => basicScore(meP, c));
      source = "basic";
    }

    const byId = new Map(candidates.map((c) => [String(c._id), c]));
    const matches = results
      .filter((r) => r.score > 0)
      .map((r) => ({ user: byId.get(r.id), ...r }))
      .sort((a, b) => Number(b.mutual) - Number(a.mutual) || b.score - a.score);

    res.json({ source, matches });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches };