import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    animeId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["watching", "completed", "dropped", "planned"],
      default: "watching",
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  { timestamps: true }
);
export const LibraryItem=mongoose.model("LibraryItem",libraryItemSchema)
