import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyToken } from "../middleware/authMiddlesware.js";
// use cloudinary for image upload
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "animatch", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
  },
});

const upload = multer({ storage: storage });
// Upload endpoint
router.post("/image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.status(200).json({
      imageUrl: req.file.path || req.file.url, // Cloudinary URL
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
});
export default router;
