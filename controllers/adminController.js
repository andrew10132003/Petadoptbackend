const Adoption = require("../models/Adoption");

// ==========================================
// Get ALL Adoption Requests - ADMIN ONLY
// ==========================================
const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate("userId", "name email phone")
      .populate("petId", "name breed age image")
      .populate("shelterId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      adoptions,
    });
  } catch (error) {
    console.error("❌ Get All Adoptions Error:", error);

    res.status(500).json({
      message:
        error.message || "Failed to fetch adoption requests",
    });
  }
};

module.exports = {
  getAllAdoptions,
};