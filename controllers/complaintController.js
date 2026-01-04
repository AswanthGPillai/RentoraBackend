const Complaint = require("../models/complaintModel");

/* =========================
   CREATE COMPLAINT (USER)
========================= */
exports.createComplaint = async (req, res) => {
  try {
    const { roomId, title, message } = req.body;

    if (!roomId || !title || !message) {
      return res.status(400).json("All fields required");
    }

    const complaint = new Complaint({
      userId: req.userId,
      roomId,
      title,
      message,
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* =========================
   GET ALL COMPLAINTS (ADMIN)
========================= */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "username email")
      .populate("roomId", "houseNumber location");

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* =========================
   RESOLVE COMPLAINT (ADMIN)
========================= */
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint resolved and removed successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};