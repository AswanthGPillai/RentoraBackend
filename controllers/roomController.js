const Room = require("../models/roomModel");

/* =========================
   CREATE ROOM
========================= */
exports.createRoom = async (req, res) => {
  try {
    const {
      houseNumber,
      location,
      address,
      propertyType,
      status = "Available",
      price,
      imageUrl,
    } = req.body;

    // ✅ Validate required fields
    if (
      !houseNumber ||
      !location ||
      !address ||
      !propertyType ||
      !price ||
      !imageUrl
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ Get uploaded images from multer
    const uploadedImages = req.files
      ? req.files.map((file) => file.filename)
      : [];

    const newRoom = new Room({
      houseNumber,
      location,
      address,
      propertyType,
      status,
      price,
      imageUrl,
      uploadedImg: uploadedImages, // ✅ correct
    });

    await newRoom.save();

    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

/* =========================
   GET ALL ROOMS
========================= */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("GET ALL ROOMS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   GET SINGLE ROOM BY ID
========================= */
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("GET ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   UPDATE ROOM
========================= */
exports.updateRoom = async (req, res) => {
  try {
    // If images updated
    if (req.files && req.files.length > 0) {
      req.body.uploadedImg = req.files.map((file) => file.filename);
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   DELETE ROOM
========================= */
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
