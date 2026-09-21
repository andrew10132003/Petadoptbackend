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

// =====================================================
// ADOPTER
// =====================================================

router.post(
  "/",
  protect,
  createAdoption
);

router.get(
  "/my",
  protect,
  getMyAdoptions
);

router.patch(
  "/:id/cancel",
  protect,
  cancelAdoption
);

// =====================================================
// SHELTER
// =====================================================

router.get(
  "/shelter",
  protect,
  getShelterAdoptions
);

router.patch(
  "/shelter/:id/approve",
  protect,
  approveAdoption
);

router.patch(
  "/shelter/:id/reject",
  protect,
  rejectAdoption
);

module.exports = router; 