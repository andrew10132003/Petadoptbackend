const express = require("express");

const router = express.Router();

const {
  getAllAdoptions,
  approveAdoption,
  rejectAdoption,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

console.log("========== ADMIN ROUTES CHECK ==========");
console.log("getAllAdoptions:", typeof getAllAdoptions);
console.log("approveAdoption:", typeof approveAdoption);
console.log("rejectAdoption:", typeof rejectAdoption);
console.log("protect:", typeof protect);
console.log("admin:", typeof admin);
console.log("=========================================");

// Get all adoption requests
router.get(
  "/adoptions",
  protect,
  admin,
  getAllAdoptions
);

// Approve
router.patch(
  "/adoptions/:id/approve",
  protect,
  admin,
  approveAdoption
);

// Reject
router.patch(
  "/adoptions/:id/reject",
  protect,
  admin,
  rejectAdoption
);

module.exports = router;