import mongoose from "mongoose";
const userShema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        maxlength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6
    }
},{timestamps:true})

export const User=mongoose.model("User",userShema);