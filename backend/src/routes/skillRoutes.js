const express = require("express");
const router = express.Router();
const { getSkills, getCategories } = require("../controllers/skillController");

router.get("/", getSkills);
router.get("/categories", getCategories);

module.exports = router;