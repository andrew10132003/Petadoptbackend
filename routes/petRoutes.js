
const express = require("express");
const router = express.Router();

const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require("../controllers/petController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

// Public pet browsing
router.get("/", getPets);
router.get("/:id", getPetById);

// Create a pet with file uploads
router.post(
  "/",
  protect,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
    { name: "medicalReport", maxCount: 1 },
  ]),
  createPet
);

// Update a pet with file uploads
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "videos", maxCount: 3 },
    { name: "medicalReport", maxCount: 1 },
  ]),
  updatePet
);

// Delete a pet
router.delete("/:id", protect, deletePet);

module.exports = router;
