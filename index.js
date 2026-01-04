// =========================
// LOAD ENV
// =========================
require("dotenv").config();

// =========================
// DB CONNECTION
// =========================
require("./dBconnection");

// =========================
// CRON JOBS
// =========================
require("./cron/bookingCron");

// =========================
// IMPORTS
// =========================
const express = require("express");
const cors = require("cors");
const route = require("./routes");

// =========================
// CREATE SERVER
// =========================
const app = express();

// =========================
// MIDDLEWARES (ORDER MATTERS)
// =========================

// ✅ CORS MUST COME FIRST
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());

// =========================
// COOP / COEP HEADERS (GOOGLE LOGIN FIX)
// =========================
app.use((req, res, next) => {
  res.setHeader(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups"
  );
  res.setHeader(
    "Cross-Origin-Embedder-Policy",
    "unsafe-none"
  );
  next();
});



app.use("/api/chat", require("./routes/chatRoutes"));
// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static("uploads"));

// =========================
// API ROUTES
// =========================
app.use("/api", route);

// =========================
// ROOT TEST
// =========================
app.get("/", (req, res) => {
  res.status(200).send("<h1>Server started successfully 🚀</h1>");
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
