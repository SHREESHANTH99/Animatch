import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import libraryRoutes from "./src/routes/libraryRoutes.js";
import groupRoutes from './src/routes/groupRoutes.js';
import postRoutes from './src/routes/postRoutes.js'; 
dotenv.config({
  path: "./.env",
});
const app = express();
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limits: "16kb" }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/library", libraryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0" , () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

export { app };
