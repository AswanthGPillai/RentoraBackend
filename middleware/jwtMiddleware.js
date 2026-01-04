const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtMiddleware = async (req, res, next) => {
  try {
    /* =========================
       1️⃣ Check Authorization Header
       Expected: Bearer <token>
    ========================= */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid Authorization format",
      });
    }

    const token = parts[1];

    /* =========================
       2️⃣ Verify JWT Token
    ========================= */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    // decoded = { userId, iat, exp }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    /* =========================
       3️⃣ Fetch User from Database
    ========================= */
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    /* =========================
       4️⃣ Attach User Info to Request
       (CRITICAL)
    ========================= */
    req.userId = user._id;     // ✅ used in controllers
    req.user = user;           // ✅ role, profile, etc.
    req.userEmail = user.email;

    /* =========================
       5️⃣ Continue to Controller
    ========================= */
    next();
  } catch (error) {
    console.error("JWT Middleware Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = jwtMiddleware;
