const express = require("express");

const router = express.Router();

const {
  createAdoption,
  getMyAdoptions,
  cancelAdoption,
} = require("../controllers/adoptionController");

const protect = require("../middleware/authMiddleware");

// Create adoption request
router.post("/", protect, createAdoption);

// Get logged-in user's adoption requests
router.get("/my", protect, getMyAdoptions);

// Cancel adoption request
router.patch("/:id/cancel", protect, cancelAdoption);

module.exports = router;