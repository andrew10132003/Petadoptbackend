const User = require("../models/User");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Unable to load profile." });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (![name, email, phone, address].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Name, email, phone and address are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (!/^[+\d][\d\s()-]{7,19}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Please provide a valid phone number." });
    }
    const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
    if (duplicate) return res.status(409).json({ message: "That email is already in use." });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name: name.trim(), email: normalizedEmail, phone: phone.trim(), address: address.trim() } },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(400).json({ message: "Unable to update profile. Check the submitted values." });
  }
};

module.exports = { getMyProfile, updateMyProfile };
