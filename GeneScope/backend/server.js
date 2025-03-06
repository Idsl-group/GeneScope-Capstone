import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allow JSON requests

// MongoDB Connection (Ensure 'files' is used instead of 'test')
mongoose.connect(process.env.MONGO_URI, {
  dbName: "files", // This changes the database name from 'test' to 'files'
});

const db = mongoose.connection;
db.once("open", () => console.log("Connected to MongoDB (Database: files)"));
db.on("error", (error) => console.error("MongoDB connection error:", error));

// Define Schema & Model
const jobSchema = new mongoose.Schema({
  email: String,
  fileName: String,
  fileUrl: String,
  returnLocationUrl: String,
  status: { type: String, default: "In Progress" },
  createdAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema); // Jobs collection inside 'files' DB

// API Route to Store Job Data
app.post("/api/jobs", async (req, res) => {
  try {
    const { email, fileName, fileUrl, returnLocationUrl, status } = req.body;

    const newJob = new Job({ email, fileName, fileUrl, returnLocationUrl, status });
    await newJob.save();

    res.status(201).json({ message: "Job added successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ error: "Failed to add job" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
