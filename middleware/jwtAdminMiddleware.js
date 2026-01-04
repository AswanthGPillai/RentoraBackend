const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtAdminMiddleware = async (req, res, next) => {
  try {
    /* =========================
       1️⃣ READ AUTH HEADER
    ========================= */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    /* =========================
       2️⃣ VALIDATE BEARER TOKEN
    ========================= */
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid Authorization format",
      });
    }

    /* =========================
       3️⃣ VERIFY JWT
    ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       4️⃣ FIND USER FROM TOKEN
    ========================= */
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    /* =========================
       5️⃣ ADMIN ROLE CHECK
    ========================= */
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    /* =========================
       6️⃣ ATTACH USER TO REQUEST
    ========================= */
    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    console.error("Admin JWT Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = jwtAdminMiddleware;
