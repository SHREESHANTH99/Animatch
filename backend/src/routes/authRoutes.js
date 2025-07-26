import { regiterUser,loginUser } from "../controllers/authController.js";
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";
import { useActionData } from "react-router-dom";
const router =express.Router()
router.post("/register",regiterUser);
router.post("/login",loginUser)

router.post('/exchange-token',async(req,res)=>{
    try{
        const {userData}= req.body;
        let dbUser;
       try{
        dbUser=await User.findOne({email:userData.email});
        if(!dbUser){
            dbUser=await User.create({
                email:userData.email,
                password:'GOOOFLE',
                username:userData.user_metadata?.full_name || userData.email,
                supabaseid:userData.id,
                createdAt:new Date(),
            });
            console.log("Created new user in database:",dbUser._id)
        }else{
             console.log("Found existing user in database:",dbUser._id)
        }
       }catch(err){
        console.log("database error:",err);
        return res.status(500).json({error:"Database error"})
       }

       const customToken=jwt.sign(
        {
            id:dbUser._id.toString(),
            email:dbUser.email,
            username:dbUser.username
        },
        process.env.JWT_SECRET,
        { expiresIn:'24h'}
       );
       res.json({
        token:customToken,
        user:{
             id:dbUser._id.toString(),
            email:dbUser.email,
            username:dbUser.username
        }
       })
    }catch(err){
        console.error("Token exchange error:",err.message);
            return res.status(500).json({error:err.message})
    }
})
export default router;