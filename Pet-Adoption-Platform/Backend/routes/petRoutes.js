const express = require("express");

const router = express.Router();

const {
  getPets,
  getPetById,
} = require("../controllers/petController");

router.get("/", getPets);

router.get("/:id", getPetById);

module.exports = router;