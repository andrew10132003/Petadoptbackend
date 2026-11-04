const express = require("express");
const mongoose = require("mongoose");

const Review = require("../models/Review");
const Pet = require("../models/Pet");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CREATE A REVIEW
// POST /api/reviews
// ==========================================
router.post("/", protect, async (req, res) => {
  try {
    const { petId, shelterId, rating, comment } = req.body;

    // Only adopters can submit reviews.
    if (req.user.role !== "adopter") {
      return res.status(403).json({
        message: "Only adopters can submit reviews.",
      });
    }

    // A review must target exactly one pet or shelter.
    const hasPet = Boolean(petId);
    const hasShelter = Boolean(shelterId);

    if (hasPet === hasShelter) {
      return res.status(400).json({
        message: "Provide either petId or shelterId, not both.",
      });
    }

    // Validate target ID.
    const targetId = hasPet ? petId : shelterId;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({
        message: "Invalid pet or shelter ID.",
      });
    }

    // Validate rating.
    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5.",
      });
    }

    // Validate comment.
    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must contain 3 to 1000 characters.",
      });
    }

    // Confirm that the target exists.
    if (hasPet) {
      const pet = await Pet.findById(petId);

      if (!pet) {
        return res.status(404).json({
          message: "Pet not found.",
        });
      }
    } else {
      const shelter = await User.findOne({
        _id: shelterId,
        role: "shelter",
      });

      if (!shelter) {
        return res.status(404).json({
          message: "Shelter not found.",
        });
      }
    }

    // Prevent duplicate reviews by the same user for the same target.
    const duplicateQuery = {
      reviewerId: req.user.id,
    };

    if (hasPet) {
      duplicateQuery.petId = petId;
    } else {
      duplicateQuery.shelterId = shelterId;
    }

    const existingReview = await Review.findOne(duplicateQuery);

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this item.",
      });
    }

    const review = await Review.create({
      reviewerId: req.user.id,
      petId: hasPet ? petId : null,
      shelterId: hasShelter ? shelterId : null,
      rating: Number(rating),
      comment: comment.trim(),
    });

    return res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      message: "Failed to submit review.",
    });
  }
});

// ==========================================
// GET REVIEWS
// GET /api/reviews?petId=...&rating=5
// GET /api/reviews?shelterId=...&rating=5
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { petId, shelterId, rating } = req.query;

    // Require exactly one target.
    if (Boolean(petId) === Boolean(shelterId)) {
      return res.status(400).json({
        message: "Provide either petId or shelterId.",
      });
    }

    const targetId = petId || shelterId;

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({
        message: "Invalid target ID.",
      });
    }

    const query = {};

    if (petId) {
      query.petId = petId;
    } else {
      query.shelterId = shelterId;
    }

    // Optional rating filter.
    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message: "Rating filter must be from 1 to 5.",
        });
      }

      query.rating = numericRating;
    }

    const reviews = await Review.find(query)
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 });

    const summary = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const result = summary[0] || {
      averageRating: 0,
      totalReviews: 0,
    };

    return res.status(200).json({
      totalReviews: result.totalReviews,
      averageRating: Number(result.averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Failed to fetch reviews.",
    });
  }
});

module.exports = router;