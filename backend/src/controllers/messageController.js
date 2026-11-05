const { z } = require("zod");
const Message = require("../models/Message");
const Swap = require("../models/Swap");

const sendMessageSchema = z.object({ text: z.string().trim().min(1).max(2000) });
const getAcceptedSwap = async (swapId, userId) => {
  if (!/^[0-9a-fA-F]{24}$/.test(swapId)) return null;
  return Swap.findOne({ _id: swapId, status: "accepted", $or: [{ from: userId }, { to: userId }] });
};

const getMessages = async (req, res, next) => {
  try {
    const swap = await getAcceptedSwap(req.params.swapId, req.user._id);
    if (!swap) return res.status(404).json({ message: "Accepted match not found" });
    const messages = await Message.find({ swap: swap._id }).populate("sender", "name").sort({ createdAt: 1 }).limit(500);
    res.json({ messages });
  } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => {
  try {
    const swap = await getAcceptedSwap(req.params.swapId, req.user._id);
    if (!swap) return res.status(404).json({ message: "Accepted match not found" });
    const message = await Message.create({ swap: swap._id, sender: req.user._id, text: req.body.text });
    await message.populate("sender", "name");
    res.status(201).json({ message });
  } catch (err) { next(err); }
};

module.exports = { getMessages, sendMessage, sendMessageSchema };
