
const Pet = require("../models/Pet");
const { uploadToCloudinary } = require("../service/cloudinaryService");

const allowedListingFields = [
  "name",
  "breed",
  "age",
  "image",
  "size",
  "color",
  "location",
  "description",
  "photos",
  "videos",
  "medicalHistory",
  "medicalReport",
  "listingStatus",
];

// Parse JSON fields sent through multipart/form-data.
const parseField = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getUploadedFiles = (req, field) => req.files?.[field] || [];

const uploadFiles = async (files, folder) =>
  Promise.all(files.map((file) => uploadToCloudinary(file, folder)));

const getPets = async (req, res) => {
  try {
    const { breed, age, size, location, sort } = req.query;
    const filter = {};

    if (breed) filter.breed = { $regex: breed, $options: "i" };
    if (age) filter.age = age;
    if (size) filter.size = { $regex: size, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };

    let query = Pet.find(filter);

    if (sort === "age_asc") query = query.sort({ age: 1 });
    else if (sort === "age_desc") query = query.sort({ age: -1 });
    else if (sort === "newest") query = query.sort({ createdAt: -1 });
    else if (sort === "oldest") query = query.sort({ createdAt: 1 });

    const pets = await query;
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json(pet);
  } catch (error) {
    res.status(400).json({ message: "Invalid pet ID" });
  }
};

const createPet = async (req, res) => {
  try {
    if (!req.user || !["admin", "shelter"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only admins and shelters can create pet listings",
      });
    }

    const { name, breed, age } = req.body;
    const photoFiles = getUploadedFiles(req, "photos");
    const videoFiles = getUploadedFiles(req, "videos");
    const reportFile = getUploadedFiles(req, "medicalReport")[0];

    if (!name || !breed || age === undefined || age === "") {
      return res.status(400).json({
        message: "Name, breed, and age are required",
      });
    }

    // Upload files to Cloudinary.
    const photos = await uploadFiles(photoFiles, "pet-adoption/photos");
    const videos = await uploadFiles(videoFiles, "pet-adoption/videos");
    const report = reportFile
      ? await uploadToCloudinary(reportFile, "pet-adoption/medical-reports")
      : null;

    // Use the first uploaded photo as the main image, or accept
    // an existing image URL for backward compatibility.
    const image = photos[0]?.url || req.body.image;

    if (!image) {
      return res.status(400).json({
        message: "Upload at least one pet photo or provide an image URL",
      });
    }

    const petData = {
      name,
      breed,
      age,
      image,
      shelterId: req.user.id,
    };

    for (const field of allowedListingFields) {
      if (
        !["name", "breed", "age", "image", "photos", "videos", "medicalReport"]
          .includes(field) &&
        Object.prototype.hasOwnProperty.call(req.body, field)
      ) {
        petData[field] = parseField(req.body[field]);
      }
    }

    petData.photos = photos;
    petData.videos = videos;

    if (report) {
      petData.medicalReport = {
        url: report.url,
        publicId: report.publicId,
        fileName: report.fileName,
      };
    }

    const pet = await Pet.create(petData);

    res.status(201).json({
      message: "Pet created successfully",
      pet,
    });
  } catch (error) {
    console.error("Create Pet Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    if (!req.user || !["admin", "shelter"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only admins and shelters can edit pet listings",
      });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (
      req.user.role === "shelter" &&
      pet.shelterId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only edit your own pet listings",
      });
    }

    const photoFiles = getUploadedFiles(req, "photos");
    const videoFiles = getUploadedFiles(req, "videos");
    const reportFile = getUploadedFiles(req, "medicalReport")[0];

    // Upload only newly supplied files.
    const photos = await uploadFiles(photoFiles, "pet-adoption/photos");
    const videos = await uploadFiles(videoFiles, "pet-adoption/videos");

    if (photos.length > 0) {
      pet.photos.push(...photos);
      pet.image = photos[0].url;
    }

    if (videos.length > 0) {
      pet.videos.push(...videos);
    }

    if (reportFile) {
      const report = await uploadToCloudinary(
        reportFile,
        "pet-adoption/medical-reports"
      );

      pet.medicalReport = {
        url: report.url,
        publicId: report.publicId,
        fileName: report.fileName,
      };
    }

    for (const field of allowedListingFields) {
      if (
        !["photos", "videos", "medicalReport", "listingStatus"].includes(field) &&
        Object.prototype.hasOwnProperty.call(req.body, field)
      ) {
        pet.set(field, parseField(req.body[field]));
      }
    }

    await pet.save();

    res.status(200).json({
      message: "Pet updated successfully",
      pet,
    });
  } catch (error) {
    console.error("Update Pet Error:", error);
    res.status(400).json({ message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    if (!req.user || !["admin", "shelter"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only admins and shelters can delete pet listings",
      });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (
      req.user.role === "shelter" &&
      pet.shelterId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only delete your own pet listings",
      });
    }

    await pet.deleteOne();

    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Unable to delete pet" });
  }
};

module.exports = {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};
