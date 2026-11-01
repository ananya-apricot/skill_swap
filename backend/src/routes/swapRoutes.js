const express = require("express");
const router = express.Router();
const { createSwap, getMySwaps, updateSwap, createSwapSchema } = require("../controllers/swapController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

router.post("/", protect, validate(createSwapSchema), createSwap);
router.get("/", protect, getMySwaps);
router.patch("/:id/:action", protect, updateSwap);

module.exports = router;