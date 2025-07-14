import express from "express";
import { verifyToken } from "../middleware/authMiddlesware.js";

const router =express.Router();
router.get('/profile',verifyToken,(req,res)=>{
    console.log("Decoded token:",req.user)
    res.status(200).json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt:req.user.createdAt
    })
})

export default router;