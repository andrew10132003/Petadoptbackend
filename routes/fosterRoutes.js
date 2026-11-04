
const express = require("express");
const router = express.Router();

const {
  applyToFoster,
  getMyFosterApplications,
  getShelterFosterApplications,
  updateFosterApplicationStatus,
  requestFosterInformation,
  respondToFosterInformation,
} = require("../controllers/fosterController");

const protect = require("../middleware/authMiddleware");

// Foster submits an application.
router.post("/apply", protect, applyToFoster);

// Foster views their own applications.
router.get("/my-applications", protect, getMyFosterApplications);

// Shelter views foster applications.
router.get(
  "/shelter-applications",
  protect,
  getShelterFosterApplications
);

// Shelter approves or rejects a foster application.
router.patch(
  "/applications/:id/status",
  protect,
  updateFosterApplicationStatus
);

// Shelter requests additional information.
router.post(
  "/applications/:id/information-requests",
  protect,
  requestFosterInformation
);

// Foster responds to a question on their own application.
router.post(
  "/my-applications/:id/information-requests/:requestId/respond",
  protect,
  respondToFosterInformation
);

module.exports = router;
