const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    breed: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: String,
      required: true,
    },

    // Keep the existing image field for compatibility
    image: {
      type: String,
      required: true,
    },

    // Additional pet details
    size: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // Multiple pet photos
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // Pet videos
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // Medical history entries
    medicalHistory: [
      {
        date: {
          type: Date,
        },
        condition: {
          type: String,
          trim: true,
          default: "",
        },
        treatment: {
          type: String,
          trim: true,
          default: "",
        },
        vaccination: {
          type: String,
          trim: true,
          default: "",
        },
        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    // Uploaded medical report document
    medicalReport: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
      fileName: {
        type: String,
        default: "",
      },
    },

    // Pet listing status
    listingStatus: {
      type: String,
      enum: ["available", "adoption-pending", "adopted"],
      default: "available",
    },

    // Existing shelter ownership — do not remove
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pet", petSchema);