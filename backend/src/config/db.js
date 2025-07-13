import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
const connectDB=async()=>{
    try{
         const conn = await mongoose.connect(`mongodb+srv://Shreeshanth99:Shre%40123@animatch.df0o23d.mongodb.net/${DB_NAME}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(err){
        console.log("MongoDb connection failed:",err);
        process.exit(1);
    }
}


export default connectDB;