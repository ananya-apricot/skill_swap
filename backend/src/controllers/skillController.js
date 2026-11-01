const Skill = require("../models/Skill");

// Escapes special characters so a search like "c++" doesn't break the pattern
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/skills?search=rea&category=Programming
const getSkills = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (category) filter.category = category;

    if (search) {
      const rx = new RegExp(escapeRegex(search), "i"); // "i" = ignore upper/lower case
      filter.$or = [{ name: rx }, { aliases: rx }];
    }

    const skills = await Skill.find(filter).sort({ name: 1 }).limit(50);
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

// GET /api/skills/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Skill.distinct("category");
    res.json({ categories: categories.sort() });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSkills, getCategories };