
const express = require("express");

const router = express.Router();

const {
  createAdoption,
  getMyAdoptions,
  cancelAdoption,
  getShelterAdoptions,
  approveAdoption,
  rejectAdoption,
  requestAdditionalInformation,
  respondToInformationRequest,
  scheduleMeetAndGreet,
  respondToMeetAndGreet,
} = require("../controllers/adoptionController");

const protect = require("../middleware/authMiddleware");

// =====================================================
// ADOPTER
// =====================================================

// Submit an adoption request
router.post("/", protect, createAdoption);

// Get my adoption requests
router.get("/my", protect, getMyAdoptions);

// Cancel an adoption request
router.patch("/:id/cancel", protect, cancelAdoption);

// Respond to a shelter's information request
router.post(
  "/:id/information-requests/:requestId/respond",
  protect,
  respondToInformationRequest
);

// Respond to a meet-and-greet proposal
router.patch(
  "/:id/meet-and-greet/respond",
  protect,
  respondToMeetAndGreet
);

// =====================================================
// SHELTER
// =====================================================

// Get adoption requests for the logged-in shelter
router.get("/shelter", protect, getShelterAdoptions);

// Approve an adoption request
router.patch(
  "/shelter/:id/approve",
  protect,
  approveAdoption
);

// Reject an adoption request
router.patch(
  "/shelter/:id/reject",
  protect,
  rejectAdoption
);

// Request additional information from an adopter
router.post(
  "/:id/information-requests",
  protect,
  requestAdditionalInformation
);

// Propose or update a meet-and-greet
router.post(
  "/:id/meet-and-greet",
  protect,
  scheduleMeetAndGreet
);

module.exports = router;
