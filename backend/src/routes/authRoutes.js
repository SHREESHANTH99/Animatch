import { regiterUser,loginUser } from "../controllers/authcontroller.js";
import express from "express"

const router =express.Router()
router.post("/register",regiterUser);
router.post("/login",loginUser)
export default router;