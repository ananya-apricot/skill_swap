const express = require("express");
const router = express.Router();
const { getSkills, getCategories, createSkill, createSkillSchema } = require("../controllers/skillController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

router.get("/", getSkills);
router.get("/categories", getCategories);
router.post("/", protect, validate(createSkillSchema), createSkill);

module.exports = router;
