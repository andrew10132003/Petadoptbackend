const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    petId: {
      type: String,
      required: true,
    },

petName: {
  type: String,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Adoption", adoptionSchema);