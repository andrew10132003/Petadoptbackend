const Adoption = require("../models/Adoption");
const Pet = require("../models/Pet");

// ==========================================
// Create Adoption Request - ADOPTER ONLY
// ==========================================
const createAdoption = async (req, res) => {
  try {
    console.log("User:", req.user);
    console.log("Body:", req.body);

    // Only adopters can submit adoption requests
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can submit adoption requests",
      });
    }

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

    // Find the pet
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    // Make sure the pet belongs to a shelter
    if (!pet.shelterId) {
      return res.status(400).json({
        message: "This pet is not assigned to a shelter",
      });
    }

    // Prevent duplicate pending request
    const existingRequest = await Adoption.findOne({
      userId: req.user.id,
      petId: pet._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending adoption request for this pet",
      });
    }

    const adoption = await Adoption.create({
      userId: req.user.id,
      petId: pet._id,
      petName: pet.name,
      shelterId: pet.shelterId,
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
// Get My Adoption Requests - ADOPTER
// ==========================================
const getMyAdoptions = async (req, res) => {
  try {
    // Only adopters should access their adoption requests
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can view their adoption requests",
      });
    }

    const adoptions = await Adoption.find({
      userId: req.user.id,
    })
      .populate("petId", "name breed age image")
      .populate("shelterId", "name email phone")
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
// Cancel Adoption Request - ADOPTER
// ==========================================
const cancelAdoption = async (req, res) => {
  try {
    // =================================================
    // ROLE CHECK
    // =================================================

    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message:
          "Only adopters can cancel adoption requests.",
      });
    }

    // =================================================
    // FIND REQUEST
    // =================================================

    const adoption =
      await Adoption.findById(
        req.params.id
      );

    if (!adoption) {
      return res.status(404).json({
        message:
          "Adoption request not found.",
      });
    }

    // =================================================
    // OWNERSHIP CHECK
    // =================================================

    if (
      adoption.userId.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only cancel your own adoption request.",
      });
    }

    // =================================================
    // STATUS CHECK
    // =================================================

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending adoption requests can be cancelled.",
      });
    }

    // =================================================
    // CANCEL
    // =================================================

    adoption.status = "cancelled";

    await adoption.save();

    return res.status(200).json({
      message:
        "Adoption request cancelled successfully.",
      adoption,
    });

  } catch (error) {

    console.error(
      "❌ Cancel Adoption Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to cancel adoption request.",
    });
  }
};

// ==========================================
// Get ALL Adoption Requests - ADMIN
// ==========================================
const getAllAdoptions = async (req, res) => {
  try {
    // Only admin can view ALL adoption requests
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view all adoption requests",
      });
    }

    const adoptions = await Adoption.find()
      .populate("userId", "name email phone")
      .populate("petId", "name breed age image")
      .populate("shelterId", "name email phone")
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
// Get Shelter Adoption Requests - SHELTER
// ==========================================
const getShelterAdoptions = async (req, res) => {
  try {
    // Only shelters can access shelter requests
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can view shelter adoption requests",
      });
    }

    const adoptions = await Adoption.find({
      shelterId: req.user.id,
    })
      .populate("userId", "name email phone address")
      .populate("petId", "name breed age image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      adoptions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch shelter adoption requests",
    });
  }
};

// ==========================================
// Approve Adoption Request - SHELTER ONLY
// ==========================================
const approveAdoption = async (req, res) => {
  try {
    // Only shelters can approve adoption requests
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can approve adoption requests",
      });
    }

    const adoption = await Adoption.findOne({
      _id: req.params.id,
      shelterId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found for your shelter",
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
// Reject Adoption Request - SHELTER ONLY
// ==========================================
const rejectAdoption = async (req, res) => {
  try {
    // Only shelters can reject adoption requests
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can reject adoption requests",
      });
    }

    const adoption = await Adoption.findOne({
      _id: req.params.id,
      shelterId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found for your shelter",
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
  getShelterAdoptions,
  approveAdoption,
  rejectAdoption,
};