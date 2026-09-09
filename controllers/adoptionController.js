const Adoption = require("../models/Adoption");

// ==========================================
// Create Adoption Request - USER
// ==========================================
const createAdoption = async (req, res) => {
  try {
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const {
      petId,
      petName,
      email,
      phone,
      address,
      occupation,
      reason,
    } = req.body;

    if (
      !petId ||
      !petName ||
      !email ||
      !phone ||
      !address ||
      !occupation ||
      !reason
    ) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const adoption = await Adoption.create({
      userId: req.user.id,
      petId,
      petName,
      email,
      phone,
      address,
      occupation,
      reason,
      status: "pending",
    });

    console.log("Saved:", adoption);

    res.status(201).json({
      message: "Adoption Request Submitted Successfully",
      adoption,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Get My Adoption Requests - USER
// ==========================================
const getMyAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      adoptions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch adoption requests",
    });
  }
};

// ==========================================
// Cancel Adoption Request - USER
// ==========================================
const cancelAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    // Only pending requests can be cancelled
    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: `Cannot cancel a ${adoption.status} request`,
      });
    }

    adoption.status = "cancelled";

    await adoption.save();

    res.status(200).json({
      message: "Adoption Request Cancelled Successfully",
      adoption,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to cancel adoption request",
    });
  }
};

// ==========================================
// Get ALL Adoption Requests - ADMIN
// ==========================================
const getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      adoptions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch adoption requests",
    });
  }
};

// ==========================================
// Approve Adoption Request - ADMIN
// ==========================================
const approveAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    // Only pending requests can be approved
    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve a ${adoption.status} request`,
      });
    }

    adoption.status = "approved";

    await adoption.save();

    res.status(200).json({
      message: "Adoption Request Approved Successfully",
      adoption,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to approve adoption request",
    });
  }
};

// ==========================================
// Reject Adoption Request - ADMIN
// ==========================================
const rejectAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    // Only pending requests can be rejected
    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject a ${adoption.status} request`,
      });
    }

    adoption.status = "rejected";

    await adoption.save();

    res.status(200).json({
      message: "Adoption Request Rejected Successfully",
      adoption,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to reject adoption request",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  createAdoption,
  getMyAdoptions,
  cancelAdoption,
  getAllAdoptions,
  approveAdoption,
  rejectAdoption,
};