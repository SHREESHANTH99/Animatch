import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import libraryRoutes from "./src/routes/libraryRoutes.js";
import groupRoutes from "./src/routes/groupRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import path from "path";
import forgotPasswordRoutes from "./src/routes/forgotPasswordRoutes.js";
import uploadRoutes from "./src/routes/upload.js";
import notificationRoute from "./src/routes/Notification.routes.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import NotificationHelper from "./src/utils/NotificationHelper.js";
import jwt from "jsonwebtoken";

dotenv.config({
  path: "./.env",
});

const app = express();
const httpServer = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.user._id;
  console.log(`User connected: ${userId}`);

  // Add user to online users
  onlineUsers.set(userId, socket.id);
  io.emit("user-online", { userId });

  // Handle joining a group
  socket.on("join-group", (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`User ${userId} joined group ${groupId}`);
  });

  // Handle leaving a group
  socket.on("leave-group", (groupId) => {
    socket.leave(`group-${groupId}`);
    console.log(`User ${userId} left group ${groupId}`);
  });

  // Handle new message
  socket.on("send-message", (data) => {
    const { groupId, message, user } = data;
    io.to(`group-${groupId}`).emit("receive-message", {
      ...message,
      user,
      createdAt: new Date(),
    });
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { groupId, userId, isTyping } = data;
    socket.to(`group-${groupId}`).emit("user-typing", { userId, isTyping });
  });

  // Handle new post
  socket.on("new-post", (data) => {
    console.log("📝 New post event received:", data);
    const groupId = data.group || data.groupId;
    if (groupId) {
      io.to(`group-${groupId}`).emit("new-post", data);
    }
  });

  // Handle delete post
  socket.on("delete-post", (data) => {
    console.log("🗑️ Delete post event received:", data);
    io.emit("delete-post", data);
  });

  // Handle new comment
  socket.on("new-comment", (data) => {
    console.log("💬 New comment event received:", data);
    const { postId, comment } = data;
    io.emit("new-comment", { postId, comment });
  });

  // Handle reaction
  socket.on("reaction", (data) => {
    console.log("❤️ Reaction event received:", data);
    io.emit("reaction", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    onlineUsers.delete(userId);
    io.emit("user-offline", { userId });
  });
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limits: "16kb" }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set up notification cleanup to run every 24 hours
setInterval(async () => {
  try {
    await NotificationHelper.cleanupOldNotifications(30);
    console.log("Notification cleanup completed");
  } catch (error) {
    console.error("Notification cleanup failed:", error);
  }
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

export { app, io };
