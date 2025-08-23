import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import libraryRoutes from "./src/routes/libraryRoutes.js";
import groupRoutes from './src/routes/groupRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import path from "path"
 import forgotPasswordRoutes from "./src/routes/forgotPasswordRoutes.js";
 import uploadRoutes from "./src/routes/upload.js";
 import notificationRoute from "./src/routes/Notification.routes.js";
 import { dirname } from "path";
 import { fileURLToPath } from 'url';
 import NotificationHelper from "./src/utils/NotificationHelper.js";
dotenv.config({
  path: "./.env",
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.use("/api/auth", forgotPasswordRoutes);
app.use('/api/upload',uploadRoutes );
app.use('/api/notifications', notificationRoute);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const runNotificationCleanup = async () => {
  try {
    await NotificationHelper.cleanupOldNotifications(30);
  } catch (error) {
    console.error('Notification cleanup failed:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0" , () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

export { app };