const express = require("express");

const router = express.Router();

const {
  createAdoption,
  getMyAdoptions,
  cancelAdoption,
  getShelterAdoptions,
  approveAdoption,
  rejectAdoption,
} = require("../controllers/adoptionController");

const protect = require("../middleware/authMiddleware");

// ==========================================
// ADOPTER ROUTES
// ==========================================

// Create adoption request
// Only adopters are allowed by the controller
router.post("/", protect, createAdoption);

// Get logged-in adopter's adoption requests
router.get("/my", protect, getMyAdoptions);

// Cancel logged-in adopter's pending request
router.patch("/:id/cancel", protect, cancelAdoption);

// ==========================================
// SHELTER ROUTES
// ==========================================

// Get adoption requests for pets belonging to
// the logged-in shelter
router.get("/shelter", protect, getShelterAdoptions);

// Approve an adoption request for the shelter's pet
router.patch(
  "/shelter/:id/approve",
  protect,
  approveAdoption
);

// Reject an adoption request for the shelter's pet
router.patch(
  "/shelter/:id/reject",
  protect,
  rejectAdoption
);

module.exports = router;