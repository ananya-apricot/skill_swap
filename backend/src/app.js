const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/skills", require("./routes/skillRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/swaps", require("./routes/swapRoutes"));

// 404 + error handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

module.exports = app;