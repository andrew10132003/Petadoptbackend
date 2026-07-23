const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express(); // ✅ Create app first

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect Database
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://petadoption-five.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/pets", petRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Pet Adoption Backend is Running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});