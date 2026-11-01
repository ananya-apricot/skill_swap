const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// The rules for what signup/login data must look like
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Is this email already taken?
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Scramble the password (10 = how much work the scrambling does)
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err); // hand errors to the error handler in app.js
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // passwordHash is hidden by default in our model, so we ask for it explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    // Same message for "no such email" and "wrong password" so attackers can't tell which emails exist
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// Returns the currently logged-in user (set by the protect middleware)
const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe, registerSchema, loginSchema };