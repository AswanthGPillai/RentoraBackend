// =========================
// IMPORTS
// =========================
const Users = require("../models/userModel");
const Booking = require("../models/bookingModel");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

/* =========================
   REGISTER
========================= */
exports.registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      profile: "",
      bio: "User",
      role: "user",
      isGoogleUser: false,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   LOGIN
========================= */
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      existingUser: user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GOOGLE LOGIN (AUTO CREATE)
========================= */
exports.googleLoginController = async (req, res) => {
  try {
    const { username, email, profile } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let existingUser = await Users.findOne({ email });

    if (!existingUser) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      existingUser = new Users({
        username,
        email,
        password: hashedPassword,
        profile,
        bio: "Google User",
        role: "user",
        isGoogleUser: true,
      });

      await existingUser.save();
    }

    const token = generateToken(existingUser._id);

    res.status(200).json({
      existingUser,
      token,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

/* =========================
   GET ALL USERS (ADMIN)
========================= */
exports.getAllUsersController = async (req, res) => {
  try {
    const admin = await Users.findById(req.userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const users = await Users.find({ role: "user" }).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE USER (ADMIN)
   ❌ BLOCK IF USER HAS BOOKINGS
========================= */
exports.deleteUserController = async (req, res) => {
  try {
    const admin = await Users.findById(req.userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const userId = req.params.id;

    // 🔴 CHECK BOOKINGS
    const hasBooking = await Booking.findOne({ userId });

    if (hasBooking) {
      return res.status(400).json({
        message: "User has bookings and cannot be deleted",
      });
    }

    await Users.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ADMIN UPDATE PROFILE
========================= */
exports.adminUpdateProfileController = async (req, res) => {
  try {
    const { username, password, profile } = req.body;
    const prof = req.file ? req.file.filename : profile;

    const updateData = { username, profile: prof };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Users.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   USER UPDATE PROFILE
========================= */
exports.userUpdateProfileController = async (req, res) => {
  try {
    const { username, password, profile, bio } = req.body;
    const prof = req.file ? req.file.filename : profile;

    const updateData = { username, profile: prof, bio };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await Users.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
