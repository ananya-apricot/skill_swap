const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { getMessages, sendMessage, sendMessageSchema } = require("../controllers/messageController");

router.get("/:swapId", protect, getMessages);
router.post("/:swapId", protect, validate(sendMessageSchema), sendMessage);
module.exports = router;
