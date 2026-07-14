const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");

const app = express(); // ✅ Create app first

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// Routes
app.use("/api/pets", petRoutes);
app.use("/api/adoptions", adoptionRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Pet Adoption Backend is Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});