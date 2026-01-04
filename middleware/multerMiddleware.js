// import multer
const multer = require("multer");
const path = require("path");

// ==========================
// STORAGE CONFIG
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // make sure uploads folder exists
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `image-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  },
});

// ==========================
// FILE FILTER
// ==========================
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, JPEG files are allowed"), false);
  }
};

// ==========================
// MULTER CONFIG
// ==========================
const multerConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = multerConfig;
