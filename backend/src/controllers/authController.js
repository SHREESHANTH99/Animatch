import {User} from "../models/User.models.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const regiterUser=async(req,res)=>{
   try{
    console.log("Content-type",req.headers["content-type"]);
    console.log("recieved data", req.body)
     const {email,username,password}=req.body;
    if([email,username,password].some((field)=>field?.trim()==="")){
        throw new Error(400,"All fields are required");
    }
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"Email already registered"})
    }
    const salt =await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,salt)


    const newUser=new User({username,email,password:hashpassword});
    await newUser.save();
     res.status(201).json({message:"User registered successfully"})
   }catch(err){
    console.log("Signup error",err)
     res.status(500).json({message:"Server Error",error:err.message});
     }
};

export const loginUser=async (req,res)=>{
    try{
        const {username,password}=req.body;
        if(!username || !password){
            return res.status(400).json({message:"Username or password is required"})
        }
        const user = await User.findOne({username});
        if(!user){
             return res.status(404).json({message:"user doesn't exist"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message:"Password is Incorrect"})
        }
        const token=jwt.sign({id:user._id,username:user.username,email:user.email,createdAt:user.createdAt},process.env.JWT_SECRET,{expiresIn:"1d"})
        res.status(200).json({token,user:{id:user._id,username:user.username,email:user.email,createdAt:user.createdAt}})
    }catch(err){
    console.log(err)
     res.status(500).json({message:"Server Error",error:err.message});
     }
}

