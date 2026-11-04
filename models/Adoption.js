
const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    // Adopter who submitted the request
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Pet being requested
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    petName: {
      type: String,
      required: true,
    },

    // Shelter responsible for this pet
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

    occupation: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    // Existing adoption application status
    status: {
      type: String,
      enum: ["pending", "cancelled", "approved", "rejected"],
      default: "pending",
    },

    // Additional information requested by the shelter
    informationRequests: [
      {
        message: {
          type: String,
          required: true,
        },

        response: {
          type: String,
          default: "",
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
    ],

    // Meet-and-greet scheduling
    meetAndGreet: {
      scheduledAt: {
        type: Date,
        default: null,
      },

      location: {
        type: String,
        default: "",
      },

      notes: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "not-scheduled",
          "proposed",
          "confirmed",
          "completed",
          "cancelled",
        ],
        default: "not-scheduled",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Adoption", adoptionSchema);
