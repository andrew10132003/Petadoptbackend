const dns = require("node:dns");
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Pet = require("./models/Pet");
const User = require("./models/User");
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
    image: "great-dane.jpg",
    description:
      "Cute and loyal Great Dane.",
  },
];
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
const createDemoUsers = async () => {
  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({
      email: demoUser.email,
    });

    if (existingUser) {
      // Make sure role is correct
      existingUser.role = demoUser.role;
      await existingUser.save();

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
};

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
    await createDemoUsers();
    const shelterUser = await User.findOne({
      email: "shelter@example.com",
      role: "shelter",
    });

    if (!shelterUser) {
      throw new Error(
        "Demo Shelter account not found"
      );
    }

    console.log(
      `✅ Shelter found: ${shelterUser.email}`
    );
    await Pet.deleteMany();

    const petsWithShelter = pets.map((pet) => ({
      ...pet,
      shelterId: shelterUser._id,
    }));

    await Pet.insertMany(petsWithShelter);

    console.log(
      "✅ Pets inserted and assigned to Demo Shelter"
    );

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