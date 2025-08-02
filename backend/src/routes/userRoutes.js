import express from "express";
import { updateprofile,deleteAccount,changePassword } from "../controllers/profile.controller.js";
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

router.patch('/edit',verifyToken,updateprofile)
router.delete('/delete',verifyToken,deleteAccount)
router.patch('/change-password',verifyToken,changePassword)
export default router;