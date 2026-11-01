const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // The frontend sends:  Authorization: Bearer <token>
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Please log in first" });
    }

    // Verify the signature and expiry. Throws an error if fake or expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return res.status(401).json({ message: "Account not available" });
    }

    req.user = user; // attach the user so later code knows who is asking
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { protect };