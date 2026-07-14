const dns = require("node:dns");
require("dotenv").config();
const mongoose = require("mongoose");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const Pet = require("./models/Pet");

const pets = [
  {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "2 Years",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d",
    description: "Friendly and playful Golden Retriever."
  },
  {
    name: "Luna",
    breed: "Persian Cat",
    age: "1 Year",
    image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4",
    description: "Calm and affectionate Persian cat."
  },
  {
    name: "Max",
    breed: "German Shepherd",
    age: "3 Years",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    description: "Loyal and intelligent companion."
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Pet.deleteMany();

    await Pet.insertMany(pets);

    console.log("✅ Pets inserted successfully!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDB();