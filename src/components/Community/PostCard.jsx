import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit3,
  Pin,
  Bookmark,
  BookmarkCheck,
  Send,
  Smile,
  Flag,
} from "lucide-react";

const PostCard = ({
  post,
  user,
  isAdmin,
  onDelete,
  onEdit,
  onReaction,
  onComment,
  onPin,
  onSave,
  onShare,
  showComments,
  toggleComments,
  newComment,
  setNewComment,
  addComment,
  deleteComment,
  showEmojiPicker,
  toggleEmojiPicker,
  emojiOptions,
  emojiCategories,
  addEmojiToComment,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const isPostOwner =
    post.author?._id === user?._id ||
    post.author === user?._id ||
    post.user?._id === user?._id;

  const isSaved = post.savedBy?.includes(user?._id);
  const isPinned = post.isPinned;

  const handleSaveEdit = () => {
    onEdit(post._id, editedContent);
    setIsEditing(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.username}`,
          text: post.content,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
    onShare?.(post._id);
  };

  return (
    <div
      className={`bg-white/10 backdrop-blur-xl rounded-2xl border ${
        isPinned
          ? "border-yellow-400/40 shadow-yellow-400/20"
          : "border-white/20"
      } shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/15 group relative`}
    >
      {/* Pinned Badge */}
      {isPinned && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
          <Pin size={12} />
          Pinned
        </div>
      )}

      <div className="p-4 lg:p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {post.username?.[0]?.toUpperCase() || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">
                  {post.username}
                </span>
                {post.isAdmin && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs">
                {new Date(post.createdAt).toLocaleString()}
                {post.isEdited && (
                  <span className="ml-2 text-gray-500">(edited)</span>
                )}
              </p>
            </div>
          </div>

          {/* Post Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-20 min-w-[180px]">
                {isPostOwner && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Edit3 size={14} />
                      Edit Post
                    </button>
                    <button
                      onClick={() => {
                        onDelete(post._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={14} />
                      Delete Post
                    </button>
                  </>
                )}
                {isAdmin && !isPostOwner && (
                  <>
                    <button
                      onClick={() => {
                        onPin(post._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-yellow-400 hover:bg-yellow-400/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Pin size={14} />
                      {isPinned ? "Unpin Post" : "Pin Post"}
                    </button>
                    <button
                      onClick={() => {
                        onDelete(post._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={14} />
                      Remove Post
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    onSave(post._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-blue-400 hover:bg-blue-400/10 transition-colors flex items-center gap-2 text-sm border-t border-white/10"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck size={14} />
                      Unsave Post
                    </>
                  ) : (
                    <>
                      <Bookmark size={14} />
                      Save Post
                    </>
                  )}
                </button>
                {!isPostOwner && (
                  <button
                    onClick={() => {
                      alert("Post reported. Our team will review it shortly.");
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-orange-400 hover:bg-orange-400/10 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Flag size={14} />
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              rows={4}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          post.content && (
            <div className="mb-4 mt-3">
              <p className="text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                {post.content}
              </p>
            </div>
          )
        )}

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div
            className={`mt-3 gap-2 rounded-xl overflow-hidden ${
              post.images.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2"
            }`}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative group/img">
                <img
                  src={image}
                  alt="Post content"
                  className={`w-full ${
                    post.images.length === 1 ? "h-96" : "h-48"
                  } object-cover hover:scale-105 transition-transform duration-200 cursor-pointer rounded-lg`}
                  onClick={() => window.open(image, "_blank")}
                />
                {index === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <span className="text-white font-bold text-2xl">
                      +{post.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <button
              onClick={() => onReaction(post._id, "like")}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 group/like ${
                post.likes?.includes(user?._id)
                  ? "text-red-400 bg-red-400/10"
                  : "text-white/70 hover:text-red-400 hover:bg-red-400/10"
              }`}
            >
              <Heart
                size={16}
                className={`group-hover/like:scale-110 transition-transform ${
                  post.likes?.includes(user?._id) ? "fill-current" : ""
                }`}
              />
              <span className="text-sm font-medium">
                {post.likes?.length || 0}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => toggleComments(post._id)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200 group/comment"
            >
              <MessageCircle
                size={16}
                className="group-hover/comment:scale-110 transition-transform"
              />
              <span className="text-sm font-medium">
                {post.comments?.length || 0}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200 group/share"
            >
              <Share2
                size={16}
                className="group-hover/share:scale-110 transition-transform"
              />
            </button>
          </div>

          {/* Reaction Emojis */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => toggleEmojiPicker(post._id)}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Smile size={16} />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker[post._id] && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-2 flex gap-1 shadow-2xl z-10">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReaction(post._id, emoji);
                      toggleEmojiPicker(post._id);
                    }}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors text-lg hover:scale-110 transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments[post._id] && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
              {post.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-2 group/comment"
                >
                  <div className="w-7 h-7 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {comment.user?.username?.[0]?.toUpperCase() || "👤"}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-3 min-w-0 hover:bg-white/10 transition-colors relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white/90 text-sm">
                        {comment.user?.username || "User"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {comment.user?._id === user?._id && (
                          <button
                            onClick={() => deleteComment(post._id, comment._id)}
                            className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/80 break-words mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.username?.[0]?.toUpperCase() || "👤"}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={newComment[post._id] || ""}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a thoughtful comment..."
                  className="w-full px-4 py-2 pr-20 border border-white/20 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 text-sm bg-white/10 text-white placeholder-white/60 backdrop-blur-sm resize-none overflow-hidden min-h-[40px] max-h-32"
                  rows="1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addComment(post._id);
                    }
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowEmojiPicker((prev) => ({
                          ...prev,
                          [`comment_${post._id}`]: !prev[`comment_${post._id}`],
                        }))
                      }
                      className="p-1 text-pink-400 hover:bg-white/10 rounded transition-colors"
                    >
                      <Smile size={14} />
                    </button>
                    {showEmojiPicker[`comment_${post._id}`] && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-2 shadow-2xl z-20">
                        <div className="grid grid-cols-5 gap-1 max-w-40">
                          {emojiCategories.reactions
                            .slice(0, 10)
                            .map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  addEmojiToComment(post._id, emoji);
                                  setShowEmojiPicker((prev) => ({
                                    ...prev,
                                    [`comment_${post._id}`]: false,
                                  }));
                                }}
                                className="p-1 rounded hover:bg-white/20 transition-colors text-sm hover:scale-110 transform"
                              >
                                {emoji}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => addComment(post._id)}
                    disabled={!newComment[post._id]?.trim()}
                    className="p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
