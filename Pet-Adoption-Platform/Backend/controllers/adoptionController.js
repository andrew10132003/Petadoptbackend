const Adoption = require("../models/Adoption");

const createAdoption = async (req, res) => {
  try {
    console.log(req.body);

    const adoption = await Adoption.create(req.body);

    console.log("Saved:", adoption);

    res.status(201).json({
      message: "Adoption Request Submitted Successfully",
      adoption,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { createAdoption };