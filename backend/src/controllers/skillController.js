const Skill = require("../models/Skill");
const { z } = require("zod");
const slugify = require("../utils/slugify");

const createSkillSchema = z.object({ name: z.string().trim().min(2).max(60) });

const createSkill = async (req, res, next) => {
  try {
    const name = req.body.name.trim();
    let skill = await Skill.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
    if (skill) return res.json({ skill });
    const category = "Other";
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (await Skill.exists({ slug })) slug = `${baseSlug}-${suffix++}`;
    skill = await Skill.create({ name, slug, category });
    res.status(201).json({ skill });
  } catch (err) { next(err); }
};

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

module.exports = { getSkills, getCategories, createSkill, createSkillSchema };
