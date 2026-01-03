import React from "react";
import { Bookmark, Clock, Trash2, ExternalLink } from "lucide-react";

const SavedPosts = ({ savedPosts, onUnsave, onNavigate, user }) => {
  if (!savedPosts || savedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔖</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Saved Posts Yet
        </h3>
        <p className="text-white/70 mb-4">Bookmark posts to read them later</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bookmark size={20} className="text-blue-400" />
          Saved Posts
        </h3>
        <span className="text-sm text-white/60">{savedPosts.length} saved</span>
      </div>

      {savedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:bg-white/15 transition-all group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {post.username?.[0]?.toUpperCase() || "👤"}
                </div>
                <span className="text-sm font-medium text-white">
                  {post.username}
                </span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-white/80 text-sm line-clamp-2 mb-2">
                {post.content}
              </p>

              {post.images && post.images.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {post.images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded bg-black/20 overflow-hidden"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {post.images.length > 3 && (
                    <div className="w-12 h-12 rounded bg-black/40 flex items-center justify-center text-xs text-white">
                      +{post.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{post.likes?.length || 0} likes</span>
                <span>•</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate(post)}
                className="p-2 rounded-lg bg-white/10 text-blue-400 hover:bg-blue-400/10 transition-all"
                title="View post"
              >
                <ExternalLink size={14} />
              </button>
              <button
                onClick={() => onUnsave(post._id)}
                className="p-2 rounded-lg bg-white/10 text-red-400 hover:bg-red-400/10 transition-all"
                title="Remove from saved"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedPosts;
