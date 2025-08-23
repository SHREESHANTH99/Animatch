import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String, default: "" },
    anime: { type: String },
    avatar: { type: String, default: "" },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true },
    tags: [String],
    memberCount: { type: Number, default: 1 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
