
const mongoose = require("mongoose");
const FosterApplication = require("../models/FosterApplication");
const Pet = require("../models/Pet");

// Foster submits an application.
const applyToFoster = async (req, res) => {
  try {
    if (req.user.role !== "foster") {
      return res.status(403).json({
        message: "Only foster users can submit foster applications.",
      });
    }

    const {
      petId,
      email,
      phone,
      address,
      experience,
      availability,
      reason,
    } = req.body;

    if (!mongoose.isValidObjectId(petId)) {
      return res.status(400).json({
        message: "Please provide a valid pet ID.",
      });
    }

    if (
      !email?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !experience?.trim() ||
      !availability?.trim() ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        message: "Please complete all required application fields.",
      });
    }

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found.",
      });
    }

    if (!pet.shelterId) {
      return res.status(400).json({
        message: "This pet has no assigned shelter.",
      });
    }

    const existingApplication = await FosterApplication.findOne({
      fosterId: req.user.id,
      petId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You already have an active application for this pet.",
      });
    }

    const application = await FosterApplication.create({
      fosterId: req.user.id,
      petId: pet._id,
      petName: pet.name,
      shelterId: pet.shelterId,
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      experience: experience.trim(),
      availability: availability.trim(),
      reason: reason.trim(),
    });

    return res.status(201).json({
      message: "Foster application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("Apply to foster error:", error);

    return res.status(500).json({
      message: "Failed to submit foster application.",
    });
  }
};

// Foster views their own applications.
const getMyFosterApplications = async (req, res) => {
  try {
    if (req.user.role !== "foster") {
      return res.status(403).json({
        message: "Only foster users can view their applications.",
      });
    }

    const applications = await FosterApplication.find({
      fosterId: req.user.id,
    })
      .populate("petId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get foster applications error:", error);

    return res.status(500).json({
      message: "Failed to fetch foster applications.",
    });
  }
};

// Shelter views applications for its pets.
const getShelterFosterApplications = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can view foster applications.",
      });
    }

    const applications = await FosterApplication.find({
      shelterId: req.user.id,
    })
      .populate("petId")
      .populate("fosterId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get shelter foster applications error:", error);

    return res.status(500).json({
      message: "Failed to fetch shelter foster applications.",
    });
  }
};

// Shelter approves or rejects an application.
const updateFosterApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can update foster applications.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid foster application ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected.",
      });
    }

    const application = await FosterApplication.findOne({
      _id: id,
      shelterId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        message: "Foster application not found for this shelter.",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message: "Only pending applications can be reviewed.",
      });
    }

    if (status === "approved") {
      const petAlreadyAssigned = await FosterApplication.findOne({
        petId: application.petId,
        status: "approved",
        _id: { $ne: application._id },
      });

      if (petAlreadyAssigned) {
        return res.status(409).json({
          message: "This pet already has an approved foster placement.",
        });
      }
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: `Foster application ${status} successfully.`,
      application,
    });
  } catch (error) {
    console.error("Update foster application status error:", error);

    return res.status(500).json({
      message: "Failed to update foster application.",
    });
  }
};

// Shelter requests additional information from a foster applicant.
const requestFosterInformation = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can request additional information.",
      });
    }

    const { id } = req.params;
    const message =
      typeof req.body.message === "string"
        ? req.body.message.trim()
        : "";

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid foster application ID.",
      });
    }

    if (!message) {
      return res.status(400).json({
        message: "Please enter the information you need from the applicant.",
      });
    }

    const application = await FosterApplication.findOne({
      _id: id,
      shelterId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        message: "Foster application not found for this shelter.",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message: "Information can only be requested for pending applications.",
      });
    }

    application.informationRequests.push({ message });
    await application.save();

    return res.status(201).json({
      message: "Additional information requested successfully.",
      application,
    });
  } catch (error) {
    console.error("Request foster information error:", error);

    return res.status(500).json({
      message: "Failed to request additional information.",
    });
  }
};

// Foster responds to a question on their own application.
const respondToFosterInformation = async (req, res) => {
  try {
    if (req.user.role !== "foster") {
      return res.status(403).json({
        message: "Only foster users can respond to information requests.",
      });
    }

    const { id, requestId } = req.params;
    const responseText =
      typeof req.body.response === "string"
        ? req.body.response.trim()
        : "";

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(requestId)
    ) {
      return res.status(400).json({
        message: "Invalid application or information-request ID.",
      });
    }

    if (!responseText) {
      return res.status(400).json({
        message: "Please enter a response.",
      });
    }

    const application = await FosterApplication.findOne({
      _id: id,
      fosterId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        message: "Foster application not found.",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        message: "Only pending applications can receive responses.",
      });
    }

    const request = application.informationRequests.id(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Information request not found.",
      });
    }

    if (request.response) {
      return res.status(409).json({
        message: "You have already responded to this request.",
      });
    }

    request.response = responseText;
    request.respondedAt = new Date();

    await application.save();

    return res.status(200).json({
      message: "Your response was submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("Respond to foster information error:", error);

    return res.status(500).json({
      message: "Failed to submit your response.",
    });
  }
};

module.exports = {
  applyToFoster,
  getMyFosterApplications,
  getShelterFosterApplications,
  updateFosterApplicationStatus,
  requestFosterInformation,
  respondToFosterInformation,
};
