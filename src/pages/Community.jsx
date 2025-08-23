import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
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
  Menu,
  Settings,
  Bell,
  Eye,
  Filter,
  Image,
  Smile,
  MoreHorizontal,
} from "lucide-react";

const Community = () => {
  const { token, user } = useAuth();
  const [activeGroup, setActiveGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupAnime, setNewGroupAnime] = useState("");
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
  const fileInputRef = useRef(null);

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

  // Image upload handler - Fixed error handling
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedImages = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert(`${file.name} is too large. Please select files under 5MB.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        // Use environment variable or fallback
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

        const response = await fetch(`${apiUrl}/api/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push({
            id: Date.now() + Math.random(),
            url: data.imageUrl,
            name: file.name,
          });
        } else {
          console.error(`Upload failed for ${file.name}:`, response.statusText);
          alert(`Failed to upload ${file.name}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        alert(`Failed to upload ${file.name}: Network error`);
      }
    }

    setSelectedImages((prev) => [...prev, ...uploadedImages]);
    setUploadingImage(false);
  };

  // Add emoji to post
  const addEmojiToPost = (emoji) => {
    setNewPost((prev) => prev + emoji);
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
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/groups`, {
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
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/notifications`, {
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
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
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
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/posts/group/${groupId}`, {
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
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/groups/create`, {
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
      setNewGroupAnime("");
    } catch (err) {
      console.error("❌ Group creation failed:", err);
      alert(err.message || "Failed to create group");
    }
  };
  const joinGroup = async (groupId) => {
    if (!groupId || !token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/groups/${groupId}/join`, {
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
    if (!newPost.trim() || !activeGroup || !token) return;

    try {
      const postData = {
        content: newPost.trim(),
        groupId: activeGroup._id,
      };

      if (selectedImages.length > 0) {
        postData.images = selectedImages.map((img) => img.url);
      }

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setNewPost("");
      setSelectedImages([]);
      fetchPosts(activeGroup._id);
    } catch (err) {
      console.error("❌ Post creation failed:", err);
      alert("Failed to create post");
    }
  };
  const handleReaction = async (postId, reactionType) => {
    if (!postId || !reactionType || !token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/posts/${postId}/react`, {
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
    if (!newComment[postId]?.trim() || !token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/posts/${postId}/comment`, {
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
  }, [token]);

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-80 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 lg:z-auto transition-transform duration-300 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
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
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
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
          <div className="flex gap-1 bg-white/10 rounded-full p-1 mb-4">
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
      <div className="flex-1 flex flex-col min-w-0">
        {activeGroup ? (
          <>
            {/* Enhanced Group Header */}
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <Menu size={18} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="text-pink-400 flex-shrink-0" size={20} />
                      <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
                        {activeGroup.name}
                      </h1>
                      {activeGroup.isPrivate && (
                        <Crown className="text-yellow-400" size={18} />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {activeGroup.anime && (
                        <span className="text-pink-300 font-medium">
                          📺 {activeGroup.anime}
                        </span>
                      )}
                      {activeGroup.description && (
                        <span className="text-white/60 hidden sm:block">
                          {activeGroup.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Stats & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Users size={16} />
                      <span>{activeGroup.memberCount || 0}</span>
                    </div>
                    <div className="text-xs text-green-400 mt-1">
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
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
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
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-3 lg:p-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-3 lg:p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user?.username?.[0]?.toUpperCase() || "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full p-3 border border-white/20 rounded-xl resize-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
                        placeholder={`What's happening in ${activeGroup.anime}? Share theories, reactions, or just say hi!`}
                        rows="3"
                      />

                      {/* Selected Images Preview */}
                      {selectedImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {selectedImages.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-12 h-12 object-cover rounded-lg border border-white/20"
                              />
                              <button
                                onClick={() =>
                                  setSelectedImages((prev) =>
                                    prev.filter((img) => img.id !== image.id)
                                  )
                                }
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                              >
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          <div className="relative">
                            <button
                              className="flex items-center gap-1 text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors"
                              onClick={() =>
                                setShowEmojiPicker((prev) => ({
                                  ...prev,
                                  post: !prev.post,
                                }))
                              }
                            >
                              <Smile size={16} />
                            </button>
                            {showEmojiPicker.post && (
                              <div className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-3 shadow-2xl z-20">
                                <div className="space-y-2">
                                  {Object.entries(emojiCategories).map(
                                    ([category, emojis]) => (
                                      <div key={category}>
                                        <p className="text-xs text-white/60 mb-1 capitalize">
                                          {category}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {emojis.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() => {
                                                addEmojiToPost(emoji);
                                                setShowEmojiPicker((prev) => ({
                                                  ...prev,
                                                  post: false,
                                                }));
                                              }}
                                              className="p-1 rounded hover:bg-white/20 transition-colors text-lg"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) =>
                                handleImageUpload(Array.from(e.target.files))
                              }
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            <button
                              className="flex items-center gap-1 text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? (
                                <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full" />
                              ) : (
                                <Image size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/50">
                            {newPost.length}/500
                          </span>
                          <button
                            onClick={handlePost}
                            disabled={
                              !newPost.trim() ||
                              newPost.length > 500 ||
                              uploadingImage
                            }
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                          >
                            <Send size={14} />
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-4">
              <div className="max-w-4xl mx-auto">
                {/* Sort Options */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-white/60" />
                    <span className="text-sm text-white/60">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white backdrop-blur-sm"
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
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-white">
                                    {post.username}
                                  </span>
                                  {post.isAdmin && (
                                    <Crown
                                      size={14}
                                      className="text-yellow-400"
                                    />
                                  )}
                                  <span className="text-xs text-white/50">
                                    •
                                  </span>
                                  <span className="text-xs text-white/50">
                                    {new Date(post.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-white/90 leading-relaxed break-words whitespace-pre-wrap">
                                  {post.content}
                                </p>

                                {/* Post Images */}
                                {post.images && post.images.length > 0 && (
                                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                                    {post.images
                                      .slice(0, 4)
                                      .map((image, index) => (
                                        <div
                                          key={index}
                                          className="relative group"
                                        >
                                          <img
                                            src={image}
                                            alt="Post content"
                                            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                            onClick={() =>
                                              window.open(image, "_blank")
                                            }
                                          />
                                          {index === 3 &&
                                            post.images.length > 4 && (
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
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-white/10 text-white/60">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

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
                                      {comment.username?.[0]?.toUpperCase() ||
                                        "👤"}
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-xl p-3 min-w-0 hover:bg-white/15 transition-colors">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-medium text-white">
                                            {comment.username}
                                          </span>
                                          <span className="text-xs text-white/50">
                                            {new Date(
                                              comment.createdAt
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                        <button className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 rounded hover:bg-white/20 text-white/60">
                                          <Heart size={12} />
                                        </button>
                                      </div>
                                      <p className="text-sm text-white/90 break-words leading-relaxed">
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
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="relative mb-6">
                <div className="text-8xl mb-4 animate-bounce">🌸</div>
                <div className="absolute -top-4 -right-4 text-3xl animate-spin">
                  ⭐
                </div>
                <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse">
                  ✨
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Welcome to Anime Hub!
              </h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                Connect with fellow anime enthusiasts, share your thoughts,
                theories, and reactions. Join communities dedicated to your
                favorite series!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Browse Communities
                </button>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 font-medium"
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
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Create New Community
                  </h3>
                  <p className="text-sm text-white/60">
                    Build a space for anime discussions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Naruto Shinobi Academy"
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="What makes this community special? What will members discuss here?"
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 resize-none bg-white/10 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200"
                  rows="3"
                />
                <p className="text-xs text-white/50 mt-1">
                  {newGroupDescription.length}/200 characters
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
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

            <div className="flex gap-3 mt-8">
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
