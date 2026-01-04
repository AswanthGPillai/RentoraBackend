// import mongoose
const mongoose = require("mongoose");

// create schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    profile: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "User",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isGoogleUser: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// create model
const Users = mongoose.model("users", userSchema);

module.exports = Users;
