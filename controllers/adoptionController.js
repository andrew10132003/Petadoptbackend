
const Adoption = require("../models/Adoption");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { sendEmail } = require("../service/emailService");

// ==========================================
// SAFE EMAIL NOTIFICATION HELPER
// ==========================================

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const sendNotification = async ({ to, subject, text, html }) => {
  try {
    if (!to) {
      console.error("Email skipped: recipient email not found");
      return;
    }

    await sendEmail({ to, subject, text, html });

    console.log("Adoption notification email sent:", to);
  } catch (error) {
    console.error("Adoption notification email failed:", error.message);
  }
};

// ==========================================
// CREATE ADOPTION - ADOPTER
// ==========================================

const createAdoption = async (req, res) => {
  try {
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can submit adoption requests",
      });
    }

    const {
      petId,
      email,
      phone,
      address,
      occupation,
      reason,
    } = req.body;

    if (!petId || !email || !phone || !address || !occupation || !reason) {
      return res.status(400).json({
        message: "All adoption application fields are required",
      });
    }

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    if (!pet.shelterId) {
      return res.status(400).json({
        message: "This pet is not associated with a shelter",
      });
    }

    if (pet.listingStatus === "adopted") {
      return res.status(400).json({
        message: "This pet has already been adopted",
      });
    }

    const existingAdoption = await Adoption.findOne({
      userId: req.user.id,
      petId,
      status: "pending",
    });

    if (existingAdoption) {
      return res.status(400).json({
        message: "You already have a pending request for this pet",
      });
    }

    const adoption = await Adoption.create({
      userId: req.user.id,
      petId,
      petName: pet.name,
      shelterId: pet.shelterId,
      email,
      phone,
      address,
      occupation,
      reason,
      status: "pending",
    });

    // Send confirmation email to the registered adopter
    const adopter = await User.findById(req.user.id);

    await sendNotification({
      to: adopter?.email,
      subject: "Adoption Application Submitted",
      text: `Hello ${adopter?.name || "Adopter"},

Your adoption application for ${pet.name} has been submitted successfully.

Your application is currently pending review.

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Adoption Application Submitted</h2>
          <p>Hello ${escapeHtml(adopter?.name || "Adopter")},</p>
          <p>Your application for <strong>${escapeHtml(pet.name)}</strong> has been submitted successfully.</p>
          <p><strong>Status:</strong> Pending review</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(201).json({
      message: "Adoption request submitted successfully",
      adoption,
    });
  } catch (error) {
    console.error("Create adoption error:", error);

    return res.status(500).json({
      message: "Failed to create adoption request",
    });
  }
};

// ==========================================
// GET MY ADOPTIONS - ADOPTER
// ==========================================

const getMyAdoptions = async (req, res) => {
  try {
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can view their adoption requests",
      });
    }

    const adoptions = await Adoption.find({
      userId: req.user.id,
    })
      .populate("petId")
      .populate("shelterId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ adoptions });
  } catch (error) {
    console.error("Get my adoptions error:", error);

    return res.status(500).json({
      message: "Failed to fetch adoption requests",
    });
  }
};

// ==========================================
// CANCEL ADOPTION - ADOPTER
// ==========================================

const cancelAdoption = async (req, res) => {
  try {
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can cancel their requests",
      });
    }

    const adoption = await Adoption.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Adoption request not found",
      });
    }

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be cancelled",
      });
    }

    adoption.status = "cancelled";
    await adoption.save();

    return res.status(200).json({
      message: "Adoption request cancelled successfully",
      adoption,
    });
  } catch (error) {
    console.error("Cancel adoption error:", error);

    return res.status(500).json({
      message: "Failed to cancel adoption request",
    });
  }
};

// ==========================================
// GET ALL ADOPTIONS - ADMIN
// ==========================================

const getAllAdoptions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can view all adoption requests",
      });
    }

    const adoptions = await Adoption.find()
      .populate("userId", "name email")
      .populate("petId")
      .populate("shelterId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ adoptions });
  } catch (error) {
    console.error("Get all adoptions error:", error);

    return res.status(500).json({
      message: "Failed to fetch all adoption requests",
    });
  }
};

// ==========================================
// GET SHELTER ADOPTIONS - SHELTER
// ==========================================

const getShelterAdoptions = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can view their adoption requests",
      });
    }

    const adoptions = await Adoption.find({
      shelterId: req.user.id,
    })
      .populate("userId", "name email")
      .populate("petId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ adoptions });
  } catch (error) {
    console.error("Get shelter adoptions error:", error);

    return res.status(500).json({
      message: "Failed to fetch shelter adoption requests",
    });
  }
};

// ==========================================
// APPROVE ADOPTION - SHELTER
// ==========================================

const approveAdoption = async (req, res) => {
  try {
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

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be approved",
      });
    }

    const pet = await Pet.findById(adoption.petId);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    if (pet.listingStatus === "adopted") {
      return res.status(400).json({
        message: "This pet has already been adopted",
      });
    }

    const otherApproved = await Adoption.findOne({
      petId: adoption.petId,
      status: "approved",
      _id: { $ne: adoption._id },
    });

    if (otherApproved) {
      return res.status(400).json({
        message: "Another adoption request has already been approved",
      });
    }

    // Find other pending applications before changing their status
    const otherPendingAdoptions = await Adoption.find({
      petId: adoption.petId,
      status: "pending",
      _id: { $ne: adoption._id },
    }).select("userId petName");

    adoption.status = "approved";
    pet.listingStatus = "adopted";

    await adoption.save();
    await pet.save();

    // Notify the approved adopter
    const adopter = await User.findById(adoption.userId);

    await sendNotification({
      to: adopter?.email,
      subject: "Your Adoption Application Has Been Approved!",
      text: `Hello ${adopter?.name || "Adopter"},

Your adoption application for ${pet.name} has been approved!

Congratulations!

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2e7d32;">Application Approved!</h2>
          <p>Hello ${escapeHtml(adopter?.name || "Adopter")},</p>
          <p>Your adoption application for <strong>${escapeHtml(pet.name)}</strong> has been approved.</p>
          <p>Congratulations!</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    // Reject other pending applications for this pet
    await Adoption.updateMany(
      {
        petId: adoption.petId,
        status: "pending",
        _id: { $ne: adoption._id },
      },
      { $set: { status: "rejected" } }
    );

    // Notify adopters whose applications were automatically rejected
    for (const otherAdoption of otherPendingAdoptions) {
      const otherAdopter = await User.findById(otherAdoption.userId);

      await sendNotification({
        to: otherAdopter?.email,
        subject: "Adoption Application Status Update",
        text: `Hello ${otherAdopter?.name || "Adopter"},

Your application for ${otherAdoption.petName} was not successful because another application for this pet was approved.

Thank you for your interest.

Pet Adoption Platform Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Adoption Application Update</h2>
            <p>Hello ${escapeHtml(otherAdopter?.name || "Adopter")},</p>
            <p>Your application for <strong>${escapeHtml(otherAdoption.petName)}</strong> was not successful because another application for this pet was approved.</p>
            <p>Thank you for your interest.</p>
            <p>Pet Adoption Platform Team</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      message: "Adoption request approved successfully",
      adoption,
    });
  } catch (error) {
    console.error("Approve adoption error:", error);

    return res.status(500).json({
      message: "Failed to approve adoption request",
    });
  }
};

// ==========================================
// REJECT ADOPTION - SHELTER
// ==========================================

const rejectAdoption = async (req, res) => {
  try {
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

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be rejected",
      });
    }

    adoption.status = "rejected";
    await adoption.save();

    const adopter = await User.findById(adoption.userId);

    await sendNotification({
      to: adopter?.email,
      subject: "Adoption Application Status Update",
      text: `Hello ${adopter?.name || "Adopter"},

Your adoption application for ${adoption.petName} has been rejected.

Thank you for your interest.

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Adoption Application Update</h2>
          <p>Hello ${escapeHtml(adopter?.name || "Adopter")},</p>
          <p>Your application for <strong>${escapeHtml(adoption.petName)}</strong> has been rejected.</p>
          <p>Thank you for your interest.</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Adoption request rejected successfully",
      adoption,
    });
  } catch (error) {
    console.error("Reject adoption error:", error);

    return res.status(500).json({
      message: "Failed to reject adoption request",
    });
  }
};

// ==========================================
// REQUEST ADDITIONAL INFORMATION - SHELTER
// ==========================================

const requestAdditionalInformation = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can request additional information",
      });
    }

    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please provide the information requested",
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

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Additional information can only be requested for pending applications",
      });
    }

    adoption.informationRequests.push({
      message: message.trim(),
    });

    await adoption.save();

    const adopter = await User.findById(adoption.userId);

    await sendNotification({
      to: adopter?.email,
      subject: "Additional Information Requested",
      text: `Hello ${adopter?.name || "Adopter"},

The shelter has requested additional information for your application for ${adoption.petName}.

Request: ${message.trim()}

Please log in to your account to respond.

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Additional Information Requested</h2>
          <p>Hello ${escapeHtml(adopter?.name || "Adopter")},</p>
          <p>The shelter needs additional information for your application for <strong>${escapeHtml(adoption.petName)}</strong>.</p>
          <p><strong>Request:</strong> ${escapeHtml(message.trim())}</p>
          <p>Please log in to your account to respond.</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Additional information requested successfully",
      adoption,
    });
  } catch (error) {
    console.error("Request additional information error:", error);

    return res.status(500).json({
      message: "Failed to request additional information",
    });
  }
};

// ==========================================
// RESPOND TO INFORMATION REQUEST - ADOPTER
// ==========================================

const respondToInformationRequest = async (req, res) => {
  try {
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can respond to information requests",
      });
    }

    const { response } = req.body;
    const { id, requestId } = req.params;

    if (typeof response !== "string" || !response.trim()) {
      return res.status(400).json({
        message: "Please provide your response",
      });
    }

    const adoption = await Adoption.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Your adoption request was not found",
      });
    }

    const informationRequest = adoption.informationRequests.id(requestId);

    if (!informationRequest) {
      return res.status(404).json({
        message: "Information request not found",
      });
    }

    informationRequest.response = response.trim();
    informationRequest.respondedAt = new Date();

    await adoption.save();

    // Notify the shelter that the adopter has responded
    const shelter = await User.findById(adoption.shelterId);
    const adopter = await User.findById(adoption.userId);

    await sendNotification({
      to: shelter?.email,
      subject: "Adopter Responded to Information Request",
      text: `Hello ${shelter?.name || "Shelter"},

${adopter?.name || "The adopter"} has responded to your additional information request for ${adoption.petName}.

Response: ${response.trim()}

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Information Request Response</h2>
          <p>Hello ${escapeHtml(shelter?.name || "Shelter")},</p>
          <p>${escapeHtml(adopter?.name || "The adopter")} has responded to your information request for <strong>${escapeHtml(adoption.petName)}</strong>.</p>
          <p><strong>Response:</strong> ${escapeHtml(response.trim())}</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Information response submitted successfully",
      adoption,
    });
  } catch (error) {
    console.error("Respond to information request error:", error);

    return res.status(500).json({
      message: "Failed to submit information response",
    });
  }
};

// ==========================================
// SCHEDULE MEET-AND-GREET - SHELTER
// ==========================================

const scheduleMeetAndGreet = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({
        message: "Only shelters can schedule meet-and-greets",
      });
    }

    const { scheduledAt, location, notes } = req.body;

    if (
      !scheduledAt ||
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        message: "Meeting date, time, and location are required",
      });
    }

    const meetingDate = new Date(scheduledAt);

    if (Number.isNaN(meetingDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid meeting date and time",
      });
    }

    if (meetingDate <= new Date()) {
      return res.status(400).json({
        message: "Meeting date and time must be in the future",
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

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Meet-and-greets can only be scheduled for pending applications",
      });
    }

    adoption.meetAndGreet = {
      scheduledAt: meetingDate,
      location: location.trim(),
      notes: typeof notes === "string" ? notes.trim() : "",
      status: "proposed",
    };

    await adoption.save();

    const adopter = await User.findById(adoption.userId);
    const formattedDate = meetingDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    await sendNotification({
      to: adopter?.email,
      subject: "Meet-and-Greet Proposed",
      text: `Hello ${adopter?.name || "Adopter"},

A meet-and-greet has been proposed for ${adoption.petName}.

Date and time: ${formattedDate}
Location: ${location.trim()}
Notes: ${notes || "None"}

Please log in to your account to confirm or cancel the meeting.

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Meet-and-Greet Proposed</h2>
          <p>Hello ${escapeHtml(adopter?.name || "Adopter")},</p>
          <p>A meeting has been proposed for <strong>${escapeHtml(adoption.petName)}</strong>.</p>
          <p><strong>Date and time:</strong> ${escapeHtml(formattedDate)}</p>
          <p><strong>Location:</strong> ${escapeHtml(location.trim())}</p>
          <p><strong>Notes:</strong> ${escapeHtml(notes || "None")}</p>
          <p>Please log in to confirm or cancel the meeting.</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Meet-and-greet proposed successfully",
      adoption,
    });
  } catch (error) {
    console.error("Schedule meet-and-greet error:", error);

    return res.status(500).json({
      message: "Failed to schedule meet-and-greet",
    });
  }
};

// ==========================================
// RESPOND TO MEET-AND-GREET - ADOPTER
// ==========================================

const respondToMeetAndGreet = async (req, res) => {
  try {
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can respond to meeting proposals",
      });
    }

    const { decision } = req.body;

    if (!["confirmed", "cancelled"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be confirmed or cancelled",
      });
    }

    const adoption = await Adoption.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!adoption) {
      return res.status(404).json({
        message: "Your adoption request was not found",
      });
    }

    if (adoption.status !== "pending") {
      return res.status(400).json({
        message: "Only pending applications can respond to meeting proposals",
      });
    }

    if (
      !adoption.meetAndGreet ||
      adoption.meetAndGreet.status !== "proposed"
    ) {
      return res.status(400).json({
        message: "There is no pending meeting proposal to respond to",
      });
    }

    adoption.meetAndGreet.status = decision;

    await adoption.save();

    const shelter = await User.findById(adoption.shelterId);
    const adopter = await User.findById(adoption.userId);

    await sendNotification({
      to: shelter?.email,
      subject: `Meet-and-Greet ${decision}`,
      text: `Hello ${shelter?.name || "Shelter"},

${adopter?.name || "The adopter"} has ${decision} the meet-and-greet for ${adoption.petName}.

Pet Adoption Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Meet-and-Greet ${escapeHtml(decision)}</h2>
          <p>Hello ${escapeHtml(shelter?.name || "Shelter")},</p>
          <p>${escapeHtml(adopter?.name || "The adopter")} has <strong>${escapeHtml(decision)}</strong> the proposed meeting for <strong>${escapeHtml(adoption.petName)}</strong>.</p>
          <p>Pet Adoption Platform Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      message:
        decision === "confirmed"
          ? "Meet-and-greet confirmed successfully"
          : "Meet-and-greet cancelled successfully",
      adoption,
    });
  } catch (error) {
    console.error("Respond to meet-and-greet error:", error);

    return res.status(500).json({
      message: "Failed to respond to meeting proposal",
    });
  }
};

// ==========================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
  createAdoption,
  getMyAdoptions,
  cancelAdoption,
  getAllAdoptions,
  getShelterAdoptions,
  approveAdoption,
  rejectAdoption,
  requestAdditionalInformation,
  respondToInformationRequest,
  scheduleMeetAndGreet,
  respondToMeetAndGreet,
};
