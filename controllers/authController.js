
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../service/emailService");

// Safely escape user-provided text before inserting into HTML
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

// ===============================
// Register User
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body || {};
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanAddress = typeof address === "string" ? address.trim() : "";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({ message: "Name must contain 2 to 80 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must contain 8 to 128 characters." });
    }
    if (!/^[+\d][\d\s()-]{7,19}$/.test(cleanPhone)) {
      return res.status(400).json({ message: "Please provide a valid phone number." });
    }
    if (cleanAddress.length < 5 || cleanAddress.length > 300) {
      return res.status(400).json({ message: "Address must contain 5 to 300 characters." });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      address: cleanAddress,
      role: "adopter",
    });

    // Welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Pet Adoption Platform!",
        text: `Hello ${user.name},

Welcome to Pet Adoption Platform!

Your account has been successfully registered.

Thank you for joining us!

Pet Adoption Platform Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2e7d32;">Welcome to Pet Adoption Platform!</h2>
            <p>Hello ${escapeHtml(user.name)},</p>
            <p>Your account has been successfully registered.</p>
            <p>You can now explore available pets and begin your adoption journey.</p>
            <p>Thank you for joining us!</p>
            <p>Regards,<br /><strong>Pet Adoption Platform Team</strong></p>
          </div>
        `,
      });

      console.log("Welcome email sent successfully:", user.email);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Registration Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ===============================
// Login User
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Login notification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Successful Login - Pet Adoption Platform",
        text: `Hello ${user.name},

You have successfully logged in to your Pet Adoption Platform account.

If this wasn't you, please secure your account.

Regards,
Pet Adoption Platform Team`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2e7d32;">Successful Login</h2>
            <p>Hello ${escapeHtml(user.name)},</p>
            <p>You have successfully logged in to your Pet Adoption Platform account.</p>
            <p>If this wasn't you, please secure your account.</p>
            <p>Regards,<br /><strong>Pet Adoption Platform Team</strong></p>
          </div>
        `,
      });

      console.log("Login notification email sent:", user.email);
    } catch (emailError) {
      console.error("Login notification email failed:", emailError.message);
    }

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ===============================
// Export Controllers
// ===============================
module.exports = {
  registerUser,
  loginUser,
};
