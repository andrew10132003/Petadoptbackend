const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      default: null,
    },

    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// A review must target either a pet or a shelter, not both.
reviewSchema.pre("validate", function () {
  const hasPet = Boolean(this.petId);
  const hasShelter = Boolean(this.shelterId);

  if (hasPet === hasShelter) {
    this.invalidate(
      "petId",
      "A review must target exactly one pet or one shelter."
    );
  }
});

module.exports = mongoose.model("Review", reviewSchema);