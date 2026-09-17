const express = require("express");

const router = express.Router();

const {
  getAllAdoptions,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all adoption requests
router.get(
  "/adoptions",
  protect,
  admin,
  getAllAdoptions
);

module.exports = router;