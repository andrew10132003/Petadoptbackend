const mongoose = require("mongoose");
const Adoption = require("../models/Adoption");
const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      adoptions,
    });
  } catch (error) {
    console.error("❌ Get All Adoptions Error:", error);

    res.status(500).json({
      message: error.message || "Failed to fetch adoption requests",
    });
  }
};

const approveAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=================================");
    console.log("🟢 APPROVE ADOPTION");
    console.log("Adoption ID:", id);
    console.log("=================================");

    // Check MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid adoption request ID",
      });
    }

    // Find adoption
    const adoption = await Adoption.findById(id);

    console.log("Adoption found:", adoption);

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    console.log("Current status:", adoption.status);

    // Only pending requests can be approved
    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve a ${adoption.status} request`,
      });
    }

    // Update status
    adoption.status = "approved";

    console.log("New status:", adoption.status);

    // Save
    const updatedAdoption = await adoption.save();

    console.log("✅ Adoption approved:", updatedAdoption);

    res.status(200).json({
      message: "Adoption request approved successfully",
      adoption: updatedAdoption,
    });
  } catch (error) {
    console.error("❌ APPROVE ADOPTION ERROR:");
    console.error(error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);

    res.status(500).json({
      message: error.message || "Failed to approve adoption request",
    });
  }
};

const rejectAdoption = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=================================");
    console.log("🔴 REJECT ADOPTION");
    console.log("Adoption ID:", id);
    console.log("=================================");

    // Check MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid adoption request ID",
      });
    }

    // Find adoption
    const adoption = await Adoption.findById(id);

    console.log("Adoption found:", adoption);

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    console.log("Current status:", adoption.status);

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject a ${adoption.status} request`,
      });
    }

    // Update status
    adoption.status = "rejected";

    console.log("New status:", adoption.status);

    // Save
    const updatedAdoption = await adoption.save();

    console.log("✅ Adoption rejected:", updatedAdoption);

    res.status(200).json({
      message: "Adoption request rejected successfully",
      adoption: updatedAdoption,
    });
  } catch (error) {
    console.error("❌ REJECT ADOPTION ERROR:");
    console.error(error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);

    res.status(500).json({
      message: error.message || "Failed to reject adoption request",
    });
  }
};
module.exports = {
  getAllAdoptions,
  approveAdoption,
  rejectAdoption,
};