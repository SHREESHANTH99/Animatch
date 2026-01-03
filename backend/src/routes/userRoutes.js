import express from "express";
import { verifyToken } from "../middleware/authMiddlesware.js";
const router = express.Router();
router.get("/profile", verifyToken, (req, res) => {
  console.log("Decoded token:", req.user);
  // Add caching headers for faster subsequent loads
  res.set("Cache-Control", "private, max-age=300"); // 5 minutes cache
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    createdAt: req.user.createdAt,
  });
});
export default router;
