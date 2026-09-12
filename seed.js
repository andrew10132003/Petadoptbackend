const dns = require("node:dns");
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Pet = require("./models/Pet");
const User = require("./models/User");

// =====================================================
// PET DATA
// =====================================================

const pets = [
  {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "2 Years",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d",
    description:
      "Friendly and playful Golden Retriever.",
  },
  {
    name: "Luna",
    breed: "Persian Cat",
    age: "1 Year",
    image:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4",
    description:
      "Calm and affectionate Persian cat.",
  },
  {
    name: "Max",
    breed: "German Shepherd",
    age: "3 Years",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    description:
      "Loyal and intelligent companion.",
  },
  {
    name: "Shiro",
    breed: "Great Dane",
    age: "8 Years",
    image:
      "great-dane.jpg",
    description:
      "cute and loyal Great Dane.",
  },
];

// =====================================================
// DEMO USERS
// =====================================================

const demoUsers = [
  {
    name: "Demo Shelter",
    email: "shelter@example.com",
    password: "Shelter@123",
    phone: "9876543210",
    address: "Chennai, Tamil Nadu",
    role: "shelter",
  },
  {
    name: "Demo Adopter",
    email: "adopter@example.com",
    password: "Adopter@123",
    phone: "9876543211",
    address: "Chennai, Tamil Nadu",
    role: "adopter",
  },
  {
    name: "Demo Foster",
    email: "foster@example.com",
    password: "Foster@123",
    phone: "9876543212",
    address: "Chennai, Tamil Nadu",
    role: "foster",
  },
];

// =====================================================
// SEED DATABASE
// =====================================================

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // -------------------------------------------------
    // PETS
    // -------------------------------------------------

    await Pet.deleteMany();

    await Pet.insertMany(pets);

    console.log("✅ Pets inserted successfully");

    // -------------------------------------------------
    // DEMO USERS
    // -------------------------------------------------

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({
        email: demoUser.email,
      });

      if (existingUser) {
        console.log(
          `ℹ️ User already exists: ${demoUser.email}`
        );
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        demoUser.password,
        10
      );

      await User.create({
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        phone: demoUser.phone,
        address: demoUser.address,
        role: demoUser.role,
      });

      console.log(
        `✅ Created ${demoUser.role}: ${demoUser.email}`
      );
    }

    console.log("=================================");
    console.log("✅ Database seeding completed!");
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);

    process.exit(1);
  }
}

seedDB();