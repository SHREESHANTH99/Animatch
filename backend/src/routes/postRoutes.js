import express from "express";
import { Group } from "../models/Group.js";
import { Post } from "../models/post.js";
import { User } from "../models/User.models.js";
import { verifyToken } from "../middleware/authMiddlesware.js";
import NotificationHelper from "../utils/NotificationHelper.js";

const router = express.Router();

/**
 * ✅ Get posts of a group with pagination
 */
router.get("/group/:groupId", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.isPrivate && !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const posts = await Post.find({ group: groupId })
      .populate("author", "username")
      .populate("likes.user", "username")
      .populate("comments.author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      isAdmin: group.admins.includes(post.author._id.toString()),
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Create a new post in group
 */
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { content, groupId, images } = req.body;

    if (!content || !groupId) {
      return res
        .status(400)
        .json({ message: "Content and groupId are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Must be a group member to post" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = new Post({
      content,
      username: user.username,
      author: req.user.id,
      group: groupId,
      images: images || [],
    });

    await post.save();

    await Group.findByIdAndUpdate(groupId, { $inc: { postCount: 1 } });

    // Populate the author field before sending response
    await post.populate("author", "username");

    res.status(201).json({
      ...post.toObject(),
      isAdmin: group.admins.includes(req.user.id),
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ React to a post (like/unlike/etc.)
 */
router.post("/:postId/react", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType = "like" } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const group = await Group.findById(post.group);
    if (group.isPrivate && !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingReaction = post.likes.find(
      (like) => like.userId.toString() === userId
    );

    if (existingReaction) {
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== userId
      );
    } else {
      post.likes.push({ userId, reactionType });

      const user = await User.findById(userId);
      await NotificationHelper.createLikeNotification(
        post.author, // 👈 FIXED: notify post.author
        userId,
        user.username,
        postId
      );
    }

    await post.save();
    res.json({ message: "Reaction updated successfully" });
  } catch (error) {
    console.error("Error reacting to post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Add comment to post (with mentions)
 */
router.post("/:postId/comment", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content)
      return res.status(400).json({ message: "Comment content is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const group = await Group.findById(post.group);
    if (group.isPrivate && !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId);

    const newComment = {
      content,
      author: userId,
      username: user.username,
      createdAt: new Date(),
    };

    post.comments.push(newComment);

    await post.save();

    await NotificationHelper.createCommentNotification(
      post.author, // 👈 FIXED: notify post.author
      userId,
      user.username,
      postId
    );

    // Mentions
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUsernames = [];

    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.push(match[1]);
    }

    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: mentionedUsernames },
      });

      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser._id.toString() !== userId) {
          await NotificationHelper.createMentionNotification(
            mentionedUser._id,
            userId,
            user.username,
            postId
          );
        }
      }
    }

    res.json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Delete post
 */
router.delete("/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const group = await Group.findById(post.group);

    const canDelete =
      post.author.toString() === req.user.id ||
      group.admins.includes(req.user.id) ||
      group.creator.toString() === req.user.id;

    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    await Group.findByIdAndUpdate(post.group, { $inc: { postCount: -1 } });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Edit post
 */
router.put("/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    post.content = content;
    post.isEdited = true;
    await post.save();

    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
