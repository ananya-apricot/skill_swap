const User = require("../models/User");

const getMatches = async (req, res, next) => {
  try {
    const me = req.user;
    const myWanted = me.skillsWanted.map((e) => String(e.skill));
    const myOffered = me.skillsOffered.map((e) => String(e.skill));

    if (!myWanted.length) {
      return res.status(400).json({ message: "Add at least one skill you want to learn" });
    }

    // Step 1: ask the database for people who offer something I want
    const candidates = await User.find(
      { _id: { $ne: me._id }, isBanned: false, "skillsOffered.skill": { $in: myWanted } },
      "name bio location preferredMode skillsOffered skillsWanted ratingAvg"
    )
      .populate("skillsOffered.skill", "name category")
      .populate("skillsWanted.skill", "name category");

    // Step 2: score each person
    const matches = candidates.map((c) => {
      const theyTeachMe = c.skillsOffered.filter((e) => myWanted.includes(String(e.skill._id)));
      const iTeachThem = c.skillsWanted.filter((e) => myOffered.includes(String(e.skill._id)));

      return {
        user: c,
        theyTeachMe: theyTeachMe.map((e) => e.skill.name),
        iTeachThem: iTeachThem.map((e) => e.skill.name),
        mutual: theyTeachMe.length > 0 && iTeachThem.length > 0,
        score: theyTeachMe.length + iTeachThem.length,
      };
    });

    // Step 3: mutual matches first, then highest score
    matches.sort((a, b) => Number(b.mutual) - Number(a.mutual) || b.score - a.score);

    res.json({ matches });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches };