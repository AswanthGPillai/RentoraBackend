// =========================
// LOAD ENV
// =========================
require("dotenv").config();

// =========================
// DB CONNECTION
// =========================
require("./dBconnection");

// =========================
// IMPORTS
// =========================
const express = require("express");
const cors = require("cors");

// =========================
// CREATE SERVER
// =========================
const app = express();

// =========================
// CORS CONFIG (EXPRESS 5 SAFE)
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://rentora-frontend-tau.vercel.app",
  "https://rentora-frontend-zduq.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================
// BODY PARSER
// =========================
app.use(express.json());

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static("uploads"));

// =========================
// ROUTES
// =========================
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api", require("./routes"));

// =========================
// ROOT TEST
// =========================
app.get("/", (req, res) => {
  res.status(200).send("<h1>Rentora backend running 🚀</h1>");
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
