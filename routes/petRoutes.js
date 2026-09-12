const express = require("express");

const router = express.Router();

const {
  getPets,
  getPetById,
  createPet,
  deletePet,
} = require("../controllers/petController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Get all pets
router.get("/", getPets);

// Get single pet
router.get("/:id", getPetById);

// Admin: create pet
router.post("/", protect, admin, createPet);

// Admin: delete pet
router.delete("/:id", protect, admin, deletePet);

module.exports = router;