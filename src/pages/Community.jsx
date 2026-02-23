import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Search,
  Users,
  Star,
  Send,
  X,
  Hash,
  Crown,
  UserPlus,
  Settings,
  Bell,
  Filter,
  Image,
  Smile,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";

const Community = () => {
  const { token, user } = useAuth();
  const socketContext = useSocket();
  const { socket, emit, on } = socketContext || {};
  const [activeGroup, setActiveGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !on) return;

    // Handle new post
    const handleNewPost = (post) => {
      setPosts((prevPosts) => [post, ...prevPosts]);
    };

    // Handle delete post
    const handleDeletePost = ({ postId }) => {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    };

    // Handle new comment
    const handleNewComment = ({ postId, comment }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );
    };

    // Handle reaction
    const handleReaction = ({ postId, userId, reactionType, action }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const updatedReactions = { ...post.reactions };
            if (action === "add") {
              updatedReactions[userId] = reactionType;
            } else {
              delete updatedReactions[userId];
            }
            return { ...post, reactions: updatedReactions };
          }
          return post;
        })
      );
    };

    // Handle typing indicator
    const handleUserTyping = ({ userId, isTyping, groupId }) => {
      if (activeGroup?._id !== groupId) return;

      setTypingUsers((prev) => {
        const newTypingUsers = { ...prev };
        if (isTyping) {
          newTypingUsers[userId] = true;
        } else {
          delete newTypingUsers[userId];
        }
        return newTypingUsers;
      });
    };

    // Set up event listeners using the context's 'on' function
    const cleanupFunctions = [
      on("new-post", handleNewPost),
      on("delete-post", handleDeletePost),
      on("new-comment", handleNewComment),
      on("reaction", handleReaction),
      on("user-typing", handleUserTyping),
    ];

    // Clean up event listeners
    return () => {
      cleanupFunctions.forEach((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, [socket, activeGroup, on]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    // Skip if socket is not properly initialized
    if (!emit || !activeGroup?._id) return;

    if (!isTyping) {
      setIsTyping(true);
      try {
        emit("typing", {
          groupId: activeGroup._id,
          isTyping: true,
        });
      } catch (error) {
        console.error("Error emitting typing event:", error);
      }
    }

    // Clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (emit) {
        emit("typing", {
          groupId: activeGroup._id,
          isTyping: false,
        });
      }
      setIsTyping(false);
    }, 2000); // 2 seconds of inactivity
  }, [emit, activeGroup?._id, isTyping]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  // Join/leave socket room when active group changes
  useEffect(() => {
    if (!socket || !activeGroup?._id) return;

    console.log("🔌 Joining group room:", activeGroup._id);

    // Join the group room
    socket.emit("join-group", activeGroup._id);

    // Leave the room when component unmounts or group changes
    return () => {
      console.log("🔌 Leaving group room:", activeGroup._id);
      socket.emit("leave-group", activeGroup._id);
    };
  }, [socket, activeGroup?._id]);

  // Emoji categories and data
  const emojiCategories = {
    reactions: ["😀", "😂", "🥰", "😍", "🤔", "😮", "😢", "😡", "🥺", "😤"],
    anime: ["🌸", "⚡", "🔥", "💫", "✨", "🌟", "💖", "💙", "💜", "🖤"],
    actions: ["👍", "👎", "👏", "🙌", "💪", "✊", "👊", "🤝", "🙏", "💯"],
    objects: ["🎌", "🗾", "🎯", "🎮", "📺", "📱", "💻", "🎧", "🎵", "🎬"],
  };

  const emojiOptions = [
    "❤️",
    "😮",
    "😂",
    "😢",
    "😡",
    "🔥",
    "👍",
    "🤔",
    "😍",
    "🎉",
  ];

  // Handle image upload with progress tracking
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    // Check total number of images (max 4)
    if (selectedImages.length + files.length > 4) {
      alert("You can upload a maximum of 4 images per post");
      return;
    }

    setUploadingImage(true);
    const uploadedImages = [];
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // First, create previews for all files
    for (const file of files) {
      // Validate file type
      if (!validImageTypes.includes(file.type)) {
        alert(
          `${file.name} is not a valid image file. Please upload a JPEG, PNG, GIF, or WebP image.`
        );
        continue;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        continue;
      }

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      uploadedImages.push({
        id: `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: previewUrl,
        name: file.name,
        file: file, // Keep the file reference for upload
        isUploading: true,
        uploadProgress: 0,
      });
    }

    // Update UI with previews immediately
    setSelectedImages((prev) => [...prev, ...uploadedImages]);

    // Process uploads
    for (const img of uploadedImages) {
      try {
        const formData = new FormData();
        formData.append("image", img.file);

        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setSelectedImages((prev) =>
              prev.map((i) =>
                i.id === img.id ? { ...i, uploadProgress: progress } : i
              )
            );
          }
        };

        xhr.open("POST", `${apiUrl}/upload/image`, true);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setSelectedImages((prev) =>
              prev.map((i) =>
                i.id === img.id
                  ? {
                      ...i,
                      url: response.imageUrl,
                      isUploading: false,
                      uploadProgress: 100,
                    }
                  : i
              )
            );
          } else {
            throw new Error(`Upload failed: ${xhr.statusText}`);
          }
        };

        xhr.onerror = () => {
          setSelectedImages((prev) => prev.filter((i) => i.id !== img.id));
          alert(`Failed to upload ${img.name}. Please try again.`);
        };

        xhr.send(formData);
      } catch (error) {
        console.error("Upload error:", error);
        setSelectedImages((prev) => prev.filter((i) => i.id !== img.id));
        alert(`Error uploading ${img.name}: ${error.message}`);
      }
    }

    setUploadingImage(false);
  };

  // Add emoji to comment
  const addEmojiToComment = (postId, emoji) => {
    setNewComment((prev) => ({
      ...prev,
      [postId]: (prev[postId] || "") + emoji,
    }));
  };

  // Fetch groups - Fixed function with better error handling
  const fetchGroups = useCallback(async () => {
    if (!token) return;

    try {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiUrl}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const groupsData = data.groups || [];
      setGroups(groupsData);

      if (groupsData.length > 0 && !activeGroup) {
        setActiveGroup(groupsData[0]);
      }
    } catch (err) {
      console.error("❌ Fetch groups error:", err);
    }
  }, [token, activeGroup]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [token]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!token || !notificationId) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      await fetch(`${apiUrl}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Fetch posts - Fixed with better error handling
  const fetchPosts = useCallback(
    async (groupId) => {
      if (!groupId || !token) return;

      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
        const res = await fetch(`${apiUrl}/posts/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const postsData = data.posts || [];
        setPosts([...postsData].reverse());
      } catch (err) {
        console.error("❌ Fetch posts error:", err);
        setPosts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const createGroup = async () => {
    if (!newGroupName.trim() || !token) return;

    try {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiUrl}/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim(),
          isPrivate: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const data = await res.json();

      setGroups((prev) => [...prev, data.group]);
      setActiveGroup(data.group);
      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (err) {
      console.error("❌ Group creation failed:", err);
      alert(err.message || "Failed to create group");
    }
  };
  const joinGroup = async (groupId) => {
    if (!groupId || !token) return;

    try {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiUrl}/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      fetchGroups();
    } catch (err) {
      console.error("❌ Join group failed:", err);
      alert("Failed to join group");
    }
  };
  const handlePost = async () => {
    console.log("📝 handlePost called");
    console.log("newPost:", newPost);
    console.log("activeGroup:", activeGroup);
    console.log("token:", token ? "exists" : "missing");

    if (
      (!newPost.trim() && selectedImages.length === 0) ||
      !activeGroup ||
      !token
    ) {
      console.log("❌ Validation failed - returning early");
      return;
    }

    try {
      setUploadingImage(true);

      // Filter out any images that are still uploading
      const readyImages = selectedImages.filter((img) => !img.isUploading);

      // Check if there are any images still uploading
      const hasUploadingImages = selectedImages.some((img) => img.isUploading);
      if (hasUploadingImages) {
        alert("Please wait for all images to finish uploading before posting");
        return;
      }

      const postData = {
        content: newPost.trim(),
        groupId: activeGroup._id,
        images: readyImages.map((img) => img.url),
      };

      console.log("📤 Sending post data:", postData);

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiUrl}/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      console.log("📥 Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      // Get the new post data from response
      const newPostData = await res.json();
      console.log("✅ Post created successfully:", newPostData);
      console.log("📊 Post author field:", newPostData.author);
      console.log("👤 Current user ID:", user?._id);
      console.log("Current posts count:", posts.length);

      // Add the new post to the UI immediately (optimistic update)
      setPosts((prevPosts) => {
        console.log("📌 Adding post to UI, previous count:", prevPosts.length);
        return [newPostData, ...prevPosts];
      });

      // Reset form
      setNewPost("");
      setSelectedImages([]);

      // Emit socket event for new post to notify other users
      if (emit && newPostData) {
        console.log("🔌 Emitting new-post event");
        emit("new-post", newPostData);
      } else {
        console.log("⚠️ Socket emit not available:", {
          emit: !!emit,
          newPostData: !!newPostData,
        });
      }

      // Scroll to the top of the posts list
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("❌ Post creation failed:", error);
      alert(error.message || "Failed to create post. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };
  const handleReaction = async (postId, reactionType) => {
    if (!postId || !reactionType || !token || !emit) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      await fetch(`${apiUrl}/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reactionType }),
      });

      if (activeGroup) {
        fetchPosts(activeGroup._id);
      }
    } catch (err) {
      console.error("❌ Reaction failed:", err);
    }
  };
  const addComment = async (postId) => {
    if (!newComment[postId]?.trim() || !token || !emit) return;

    const content = newComment[postId].trim();

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const data = await response.json();

      // Emit socket event for new comment
      emit("new-comment", {
        postId,
        comment: data.comment,
      });

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      await fetch(`${apiUrl}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment[postId].trim() }),
      });

      setNewComment((prev) => ({ ...prev, [postId]: "" }));

      if (activeGroup) {
        fetchPosts(activeGroup._id);
      }
    } catch (err) {
      console.error("❌ Comment failed:", err);
    }
  };
  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleEmojiPicker = (postId) => {
    setShowEmojiPicker((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  useEffect(() => {
    if (token) {
      fetchGroups();
      fetchNotifications();
    }
  }, [token, fetchGroups, fetchNotifications]);

  useEffect(() => {
    if (activeGroup && activeGroup._id) {
      fetchPosts(activeGroup._id);
    }
  }, [activeGroup, fetchPosts]);
  const filteredGroups = groups.filter(
    (group) =>
      group &&
      group.name &&
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === "popular") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    if (sortBy === "comments") {
      return (b.comments?.length || 0) - (a.comments?.length || 0);
    }
    return 0;
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notifications-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const renderTypingIndicator = () => {
    if (Object.keys(typingUsers).length === 0) return null;

    const typingUserIds = Object.keys(typingUsers);
    const typingUserNames = typingUserIds
      .filter((id) => id !== user?._id) // Don't show current user in typing indicator
      .map((id) => {
        const user = groups.flatMap((g) => g.members).find((m) => m._id === id);
        return user?.username || "Someone";
      });

    if (typingUserNames.length === 0) return null;

    return (
      <div className="text-xs text-gray-400 mt-1 ml-2">
        {typingUserNames.join(", ")}
        {typingUserNames.length === 1 ? " is " : " are "}
        typing...
      </div>
    );
  };

  const handlePostInputChange = (e) => {
    const value = e.target.value;
    setNewPost(value);
    handleTyping();
  };

  // Cleanup image URLs when component unmounts or when images change
  useEffect(() => {
    // Store the current selected images to clean up later
    const currentImages = [...selectedImages];

    return () => {
      currentImages.forEach((img) => {
        if (img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [selectedImages]);

  const renderPostForm = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10 shadow-2xl">
      <div className="flex items-start space-x-4">
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt={user?.username}
          className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50"
        />
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={newPost}
              onChange={handlePostInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
              placeholder={`What's on your mind, ${
                user?.username || "friend"
              }?`}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none transition-all duration-200"
              rows={3}
            />
            {renderTypingIndicator()}
          </div>

          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {selectedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20"
                >
                  <div className="relative w-full aspect-square">
                    <img
                      src={img.url}
                      alt="Preview"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/image-placeholder.png";
                      }}
                    />
                  </div>
                  {img.isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                        style={{ width: `${img.uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImages((prev) =>
                        prev.filter((i) => i.id !== img.id)
                      );
                    }}
                    className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="flex space-x-1">
              {/* Image Upload Button */}
              <label className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleImageUpload(e.target.files);
                    e.target.value = ""; // Reset input to allow selecting same file again
                  }}
                />
                <div className="flex items-center space-x-1">
                  <Image size={20} className="text-purple-300" />
                  <span className="text-sm hidden sm:inline">Photo/Video</span>
                </div>
              </label>

              {/* Emoji Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker((prev) => ({
                      ...prev,
                      post: !prev.post,
                    }))
                  }
                  className="p-2 text-white/70 hover:text-yellow-300 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Smile size={20} />
                </button>
                {showEmojiPicker.post && (
                  <div className="absolute bottom-12 left-0 bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl p-3 z-10 w-64 border border-white/10">
                    <div className="grid grid-cols-8 gap-1">
                      {Object.values(emojiCategories)
                        .flat()
                        .map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewPost((prev) => prev + emoji);
                              setShowEmojiPicker((prev) => ({
                                ...prev,
                                post: false,
                              }));
                            }}
                            className="text-xl hover:bg-white/10 p-1 rounded-lg transition-colors hover:scale-110 transform"
                          >
                            {emoji}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handlePost}
              disabled={
                (!newPost.trim() && selectedImages.length === 0) ||
                uploadingImage
              }
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                (!newPost.trim() && selectedImages.length === 0) ||
                uploadingImage
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/20"
              }`}
            >
              {uploadingImage ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {selectedImages.some((img) => img.isUploading)
                    ? "Uploading..."
                    : "Posting..."}
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add delete post function
  const deletePost = async (postId) => {
    if (!postId || !token) return;

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      console.log("🗑️ Deleting post:", postId);
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiUrl}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      console.log("✅ Post deleted successfully");

      // Update UI by removing the deleted post
      setPosts((prev) => prev.filter((post) => post._id !== postId));

      // Emit socket event to notify other users
      if (emit) {
        emit("delete-post", { postId });
      }
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Add delete comment function
  const deleteComment = async (postId, commentId) => {
    if (!postId || !commentId || !token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
      const res = await fetch(
        `${apiUrl}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      // Update UI by removing the deleted comment
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-xl border-b border-white/10 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
          >
            {showSidebar ? <X size={20} /> : <Hash size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Star className="text-white" size={12} />
            </div>
            <h1 className="text-white font-bold text-lg">Anime Hub</h1>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-80 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 lg:z-auto transition-transform duration-300 ease-in-out mt-14 lg:mt-0`}
      >
        {/* Sidebar Header - Hidden on mobile since we have top bar */}
        <div className="hidden lg:block p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Star className="text-white" size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Anime Hub
                </h2>
                <p className="text-xs text-white/60">
                  Connect • Discuss • Discover
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
              size={16}
            />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-full focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-white/10 rounded-full p-1">
            {["all", "joined", "trending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab === "all" && "All"}
                {tab === "joined" && "Joined"}
                {tab === "trending" && "🔥 Hot"}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Search & Filter - Visible only on mobile */}
        <div className="lg:hidden p-4 border-b border-white/10 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
              size={16}
            />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-full focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          <div className="flex gap-2 bg-white/10 rounded-full p-1">
            {["all", "joined", "trending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab === "all" && "All"}
                {tab === "joined" && "Joined"}
                {tab === "trending" && "🔥"}
              </button>
            ))}
          </div>
        </div>

        {/* Groups List */}
        <div className="overflow-y-auto h-full pb-20">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-white/60">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p>No communities found</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group._id}
                onClick={() => {
                  setActiveGroup(group);
                  setShowSidebar(false);
                }}
                className={`relative p-4 border-b border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10 group ${
                  activeGroup?._id === group._id
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-l-4 border-l-pink-400"
                    : ""
                }`}
              >
                {/* Group Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={14} className="text-pink-400 flex-shrink-0" />
                      <h3 className="font-semibold text-white truncate">
                        {group.name}
                      </h3>
                      {group.isPrivate && (
                        <Crown
                          size={12}
                          className="text-yellow-400 flex-shrink-0"
                        />
                      )}
                    </div>

                    {group.anime && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full">
                          📺 {group.anime}
                        </span>
                      </div>
                    )}

                    {group.description && (
                      <p className="text-xs text-white/70 line-clamp-2 mb-3">
                        {group.description}
                      </p>
                    )}

                    {/* Group Stats */}
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {group.memberCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          {group.onlineCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  {!group.isMember && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinGroup(group._id);
                      }}
                      className="ml-2 p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg group-hover:shadow-xl"
                    >
                      <UserPlus size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 mt-14 lg:mt-0 h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
        {activeGroup ? (
          <>
            {/* Enhanced Group Header */}
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-3 sm:p-4 shadow-lg flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="text-white" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="text-pink-400 flex-shrink-0" size={18} />
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                        {activeGroup.name}
                      </h1>
                      {activeGroup.isPrivate && (
                        <Crown
                          className="text-yellow-400 flex-shrink-0"
                          size={16}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                      {activeGroup.anime && (
                        <span className="text-pink-300 font-medium">
                          📺 {activeGroup.anime}
                        </span>
                      )}
                      {activeGroup.description && (
                        <span className="text-white/60 hidden sm:block truncate">
                          {activeGroup.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Stats & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Users size={14} />
                      <span className="text-xs sm:text-sm">
                        {activeGroup.memberCount || 0} members
                      </span>
                    </div>
                    <div className="text-xs text-green-400 mt-0.5">
                      🟢 {activeGroup.onlineCount || 0} online
                    </div>
                  </div>

                  <div className="flex gap-2 relative">
                    <button
                      className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors relative"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell size={16} />
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        </div>
                      )}
                    </button>
                    <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <Settings size={16} />
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-50 notifications-dropdown">
                        <div className="p-4 border-b border-white/10">
                          <h3 className="font-semibold text-white">
                            Notifications
                          </h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-white/60">
                              <Bell
                                size={24}
                                className="mx-auto mb-2 opacity-50"
                              />
                              <p>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`p-4 border-b border-white/10 hover:bg-white/10 cursor-pointer ${
                                  !notification.read ? "bg-white/5" : ""
                                }`}
                                onClick={() =>
                                  markNotificationAsRead(notification._id)
                                }
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    {notification.type === "like" && (
                                      <Heart size={14} />
                                    )}
                                    {notification.type === "comment" && (
                                      <MessageCircle size={14} />
                                    )}
                                    {notification.type === "mention" && (
                                      <Bell size={14} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Composer */}
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-3 lg:p-4 flex-shrink-0">
              <div className="max-w-4xl mx-auto">{renderPostForm()}</div>
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="max-w-4xl mx-auto">
                {/* Sort Options */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-white/60" />
                    <span className="text-xs sm:text-sm text-white/60">
                      Sort by:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm text-white backdrop-blur-sm"
                    >
                      <option value="recent" className="bg-gray-800">
                        Most Recent
                      </option>
                      <option value="popular" className="bg-gray-800">
                        Most Liked
                      </option>
                      <option value="comments" className="bg-gray-800">
                        Most Discussed
                      </option>
                    </select>
                  </div>
                  <span className="text-xs text-white/50">
                    {posts.length} posts
                  </span>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
                      <span className="ml-3 text-white/70">
                        Loading posts...
                      </span>
                    </div>
                  ) : sortedPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🌸</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No posts yet!
                      </h3>
                      <p className="text-white/70 mb-4">
                        Be the first to share something about{" "}
                        {activeGroup.anime}
                      </p>
                      <button
                        onClick={() =>
                          document.querySelector("textarea").focus()
                        }
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Start the conversation
                      </button>
                    </div>
                  ) : (
                    sortedPosts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/15 group"
                      >
                        <div className="p-4 lg:p-6">
                          {/* Post Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {post.username?.[0]?.toUpperCase() || "👤"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className="font-semibold text-white">
                                    {post.username}
                                  </span>
                                  {/* Show delete button if user is the post author */}
                                  {(post.author?._id === user?._id ||
                                    post.author === user?._id ||
                                    post.user?._id === user?._id) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deletePost(post._id);
                                      }}
                                      className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                                      title="Delete post"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-400 text-xs">
                                  {new Date(post.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-white/10 text-white/60">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {/* Post Content */}
                          {post.content && (
                            <div className="mb-4 mt-3">
                              <p className="text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          )}

                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                              {post.images.slice(0, 4).map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image}
                                    alt="Post content"
                                    className="w-full h-32 object-contain hover:scale-105 transition-transform duration-200 cursor-pointer"
                                    onClick={() => window.open(image, "_blank")}
                                  />
                                  {index === 3 && post.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                      <span className="text-white font-bold">
                                        +{post.images.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Post Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              {/* Like Button */}
                              <button
                                onClick={() => handleReaction(post._id, "like")}
                                className="flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group/like"
                              >
                                <Heart
                                  size={16}
                                  className="group-hover/like:scale-110 transition-transform"
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
                              <button className="flex items-center gap-2 px-3 py-2 rounded-full text-white/70 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200 group/share">
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
                                <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 p-2 flex gap-1 shadow-2xl z-10">
                                  {emojiOptions.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        handleReaction(post._id, emoji);
                                        toggleEmojiPicker(post._id);
                                      }}
                                      className="p-2 rounded-lg hover:bg-white/20 transition-colors text-lg"
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
                              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {post.comments?.map((comment) => (
                                  <div
                                    key={comment._id}
                                    className="flex items-start gap-2 group/comment"
                                  >
                                    <div className="w-7 h-7 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {comment.user?.username?.[0]?.toUpperCase() ||
                                        "👤"}
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-xl p-3 min-w-0 hover:bg-white/10 transition-colors relative">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-white/90 text-sm">
                                          {comment.user?.username || "User"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-400">
                                            {new Date(
                                              comment.createdAt
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                          {comment.user?._id === user?._id && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (
                                                  window.confirm(
                                                    "Delete this comment?"
                                                  )
                                                ) {
                                                  deleteComment(
                                                    post._id,
                                                    comment._id
                                                  );
                                                }
                                              }}
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
                                      <div className="flex justify-end mt-1">
                                        <button className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 rounded hover:bg-white/20 text-white/60">
                                          <Heart size={14} />
                                        </button>
                                      </div>
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
                                      e.target.style.height =
                                        e.target.scrollHeight + "px";
                                    }}
                                  />
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowEmojiPicker((prev) => ({
                                            ...prev,
                                            [`comment_${post._id}`]:
                                              !prev[`comment_${post._id}`],
                                          }))
                                        }
                                        className="p-1 text-pink-400 hover:bg-white/10 rounded transition-colors"
                                      >
                                        <Smile size={12} />
                                      </button>
                                      {showEmojiPicker[
                                        `comment_${post._id}`
                                      ] && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-2 shadow-2xl z-20">
                                          <div className="grid grid-cols-5 gap-1 max-w-40">
                                            {emojiCategories.reactions
                                              .slice(0, 10)
                                              .map((emoji) => (
                                                <button
                                                  key={emoji}
                                                  onClick={() => {
                                                    addEmojiToComment(
                                                      post._id,
                                                      emoji
                                                    );
                                                    setShowEmojiPicker(
                                                      (prev) => ({
                                                        ...prev,
                                                        [`comment_${post._id}`]: false,
                                                      })
                                                    );
                                                  }}
                                                  className="p-1 rounded hover:bg-white/20 transition-colors text-sm"
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 relative inline-block">
                <div className="text-7xl sm:text-8xl animate-bounce">🎌</div>
                <div className="absolute -top-4 -right-4 text-2xl sm:text-3xl animate-spin">
                  ⭐
                </div>
                <div className="absolute -bottom-2 -left-4 text-xl sm:text-2xl animate-pulse">
                  ✨
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Welcome to Anime Hub!
              </h2>
              <p className="text-sm sm:text-base text-white/70 mb-6 leading-relaxed px-4">
                Connect with fellow anime enthusiasts, share your thoughts,
                theories, and reactions. Join communities dedicated to your
                favorite series!
              </p>
              <div className="flex flex-col gap-3 px-4">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="w-full sm:w-auto sm:mx-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Browse Communities
                </button>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="w-full sm:w-auto sm:mx-auto px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-medium"
                >
                  Create New Community
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Create New Community
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    Build a space for anime discussions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Naruto Shinobi Academy"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="What makes this community special? What will members discuss here?"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 resize-none bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                  rows="3"
                />
                <p className="text-xs text-white/50 mt-1">
                  {newGroupDescription.length}/200 characters
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-white mb-1">
                      Community Guidelines
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Your community will be public by default. Make sure to set
                      clear rules and maintain a welcoming environment for all
                      anime fans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!newGroupName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
