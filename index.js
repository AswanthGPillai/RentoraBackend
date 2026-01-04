// =========================
// LOAD ENV
// =========================
require("dotenv").config();

// =========================
// DB CONNECTION
// =========================
require("./dBconnection");

// ❌ REMOVE IN-APP CRON
// require("./cron/bookingCron");

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

// ✅ CORS (LOCAL + PROD)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rentora-frontend-zduq.vercel.app",
    ],
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

// =========================
// ROUTES
// =========================
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api", route);

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static("uploads"));

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
