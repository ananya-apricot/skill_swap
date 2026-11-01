const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  updateProfileSchema,
} = require("../controllers/userController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, validate(updateProfileSchema), updateMyProfile);
router.get("/:id", protect, getPublicProfile); // must stay AFTER "/me"

module.exports = router;