const Suggestion = require("../models/suggestionModel");

/* =========================
   CREATE SUGGESTION (USER)
========================= */
exports.createSuggestion = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json("All fields required");
    }

    const suggestion = new Suggestion({
      userId: req.userId,
      title,
      message,
    });

    await suggestion.save();
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* =========================
   GET ALL SUGGESTIONS (ADMIN)
========================= */
exports.getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().populate(
      "userId",
      "username email"
    );
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* =========================
   DELETE SUGGESTION (ADMIN)
========================= */
exports.deleteSuggestion = async (req, res) => {
  try {
    await Suggestion.findByIdAndDelete(req.params.id);
    res.status(200).json("Suggestion deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
};
