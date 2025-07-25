import { regiterUser,loginUser } from "../controllers/authController.js";
import express from "express";
import { supabaseLogin } from "../controllers/authController.js";
const router =express.Router()
router.post("/register",regiterUser);
router.post("/login",loginUser)
router.post("/supabase-login", supabaseLogin);
export default router;