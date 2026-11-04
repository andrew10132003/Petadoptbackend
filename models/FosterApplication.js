
const mongoose = require("mongoose");

const informationRequestSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      default: "",
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: false }
);

const fosterApplicationSchema = new mongoose.Schema(
  {
    fosterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    petName: {
      type: String,
      required: true,
    },

    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    availability: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    informationRequests: {
      type: [informationRequestSchema],
      default: [],
    },

    placement: {
      startDate: {
        type: Date,
        default: null,
      },

      expectedEndDate: {
        type: Date,
        default: null,
      },

      actualEndDate: {
        type: Date,
        default: null,
      },

      careInstructions: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FosterApplication",
  fosterApplicationSchema
);
