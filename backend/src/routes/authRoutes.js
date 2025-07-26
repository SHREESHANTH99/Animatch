import { regiterUser,loginUser } from "../controllers/authController.js";
import express from "express";
import jwt from "jsonwebtoken";
const router =express.Router()
router.post("/register",regiterUser);
router.post("/login",loginUser)

router.post('/exchange-token',async(req,res)=>{
    try{
        const {supabaseToken,userData}= req.body;

        if(!supabaseToken || !userData){
            return res.status(400).json({error:"Missing supabaseToken or userData"})
        }
        const customToken = jwt.sign({
            id:userData.id,
            email:userData.email,
            username:userData.user_metadata?.full_name || userData.email,
        },
        process.env.JWT_SECRET,
        {expiresIn:'24h'}
    );
    res.json({
        token:customToken,
        user:{
            id:userData.id,
            email:userData.email,
            username:userData.user_metadata?.full_name || userData.email,
        }
    })
    }catch(err){
        console.error('Token exchange error:',err);
         return res.status(500).json({error:"Token exchange failed"})
    }
})
export default router;