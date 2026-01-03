import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: false },
    username: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["like", "love", "wow", "sad", "angry"],
          default: "like",
        },
      },
    ],
    comments: [
      {
        content: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    images: [String],
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Index for better search performance
postSchema.index({ content: "text", username: "text" });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
