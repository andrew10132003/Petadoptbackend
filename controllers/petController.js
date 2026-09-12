const Pet = require("../models/Pet");

// ===============================
// Get all pets
// ===============================
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find();

    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Get single pet
// ===============================
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Create new pet - Admin
// ===============================
const createPet = async (req, res) => {
  try {
    const {
      name,
      breed,
      age,
      image,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !breed || !age || !image) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const pet = await Pet.create({
      name,
      breed,
      age,
      image,
      description: description || "",
    });

    res.status(201).json({
      message: "Pet created successfully",
      pet,
    });
  } catch (error) {
    console.error("Create Pet Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Delete pet - Admin
// ===============================
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("Delete Pet Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Export controllers
// ===============================
module.exports = {
  getPets,
  getPetById,
  createPet,
  deletePet,
};