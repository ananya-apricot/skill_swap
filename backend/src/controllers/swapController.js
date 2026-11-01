const { z } = require("zod");
const Swap = require("../models/Swap");
const User = require("../models/User");

const createSwapSchema = z.object({
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id"),
  message: z.string().max(500).optional(),
});

// POST /api/swaps  -> send a request
const createSwap = async (req, res, next) => {
  try {
    const { to, message } = req.body;

    if (to === String(req.user._id)) {
      return res.status(400).json({ message: "You can't swap with yourself" });
    }

    const target = await User.findOne({ _id: to, isBanned: false });
    if (!target) return res.status(404).json({ message: "User not found" });

    // Block duplicates: any open swap between these two people, in either direction
    const open = await Swap.findOne({
      status: { $in: ["pending", "accepted"] },
      $or: [
        { from: req.user._id, to },
        { from: to, to: req.user._id },
      ],
    });
    if (open) return res.status(409).json({ message: "A swap with this user is already open" });

    const swap = await Swap.create({ from: req.user._id, to, message });
    res.status(201).json({ swap });
  } catch (err) {
    next(err);
  }
};

// GET /api/swaps  -> all my swaps (sent and received)
const getMySwaps = async (req, res, next) => {
  try {
    const swaps = await Swap.find({ $or: [{ from: req.user._id }, { to: req.user._id }] })
      .populate("from to", "name location")
      .sort({ createdAt: -1 });
    res.json({ swaps });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/swaps/:id/:action   (accept | reject | cancel | complete)
const updateSwap = async (req, res, next) => {
  try {
    const { id, action } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ message: "Invalid id" });

    const swap = await Swap.findById(id);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    const me = String(req.user._id);
    const isSender = String(swap.from) === me;
    const isReceiver = String(swap.to) === me;

    // Who may do what, and from which status
    const rules = {
      accept: { ok: isReceiver, from: "pending", to: "accepted" },
      reject: { ok: isReceiver, from: "pending", to: "rejected" },
      cancel: { ok: isSender, from: "pending", to: "cancelled" },
      complete: { ok: isSender || isReceiver, from: "accepted", to: "completed" },
    };

    const rule = rules[action];
    if (!rule) return res.status(400).json({ message: "Unknown action" });
    if (!rule.ok) return res.status(403).json({ message: "You can't do that on this swap" });
    if (swap.status !== rule.from) {
      return res.status(400).json({ message: `Swap must be ${rule.from} to ${action}` });
    }

    swap.status = rule.to;
    await swap.save();
    res.json({ swap });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSwap, getMySwaps, updateSwap, createSwapSchema };