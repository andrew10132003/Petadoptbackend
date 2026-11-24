const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMyProfile, updateMyProfile } = require("../controllers/profileController");

const router = express.Router();
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

module.exports = router;
