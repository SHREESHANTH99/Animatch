import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Settings,
  Eye,
  Edit3,
  Play,
  BookOpen,
  Activity,
  TrendingUp,
  Key,
  Bell,
  Shield,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import apiInstance from "../utils/api.js";
const ProfilePage2 = () => {
  const { user, logout } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await apiInstance.get("/library");
        setLibrary(res.data);
      } catch (err) {
        console.error("Error fetching library:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchLibrary();
    }
  }, [user]);
  const getStats = () => {
    const watchlist = library.filter(
      (anime) => anime.status === "planned"
    ).length;
    const watching = library.filter(
      (anime) => anime.status === "watching"
    ).length;
    const completed = library.filter(
      (anime) => anime.status === "completed"
    ).length;

    return { watchlist, watching, completed };
  };

  const getRecentActivity = () => {
  console.log("=== RECENT ACTIVITY DEBUG ===");
  console.log("Library for recent activity:", library);
  
  if (!library || library.length === 0) {
    console.log("No library items found");
    return [];
  }
  
  const itemsWithTimestamps = library.filter((anime) => 
    anime.updated_at || anime.created_at || anime.createdAt || anime.updatedAt
  );
  
  console.log("Items with any timestamp:", itemsWithTimestamps.length);
  console.log("Sample timestamp values:", itemsWithTimestamps.slice(0, 3).map(item => ({
    title: item.title,
    updated_at: item.updated_at,
    created_at: item.created_at,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  })));
  
  if (itemsWithTimestamps.length === 0) {
    console.log("No items with timestamps found");
    return [];
  }
  
  const sortedItems = itemsWithTimestamps.sort((a, b) => {
    const dateA = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt);
    const dateB = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt);
    return dateB - dateA;
  });
  
  const recentItems = sortedItems.slice(0, 5);
  console.log("Recent 5 items:", recentItems);
  
  const mappedActivity = recentItems.map((anime) => ({
    id: anime.id || anime._id || anime.animeId,
    anime: anime.title,
    action: getActionText(anime.status),
    date: formatDate(anime.updated_at || anime.updatedAt || anime.created_at || anime.createdAt),
  }));
  
  console.log("Final mapped activity:", mappedActivity);
  return mappedActivity;
};

  const getActionText = (status) => {
    switch (status) {
      case "watching":
        return "Started Watching";
      case "completed":
        return "Completed";
      case "planned":
        return "Added to Watchlist";
      case "dropped":
        return "Dropped";
      default:
        return "Updated";
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  const stats = getStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-gray-400 text-sm">Manage your anime journey</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300 border border-red-500/20 hover:border-red-500/40 group"
          >
            <LogOut
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            Logout
          </button>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <User size={48} className="text-white" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {user.user_metadata?.full_name || user?.username}
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 text-gray-300 mb-4">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Mail size={18} className="text-purple-400" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Calendar size={18} className="text-blue-400" />
                  <span>
                    Joined on{" "}
                    {new Date(
                      user?.createdAt || user.created_at
                    ).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 group">
                <Edit3
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-110 transition-transform">
                <Eye size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Watchlist</p>
                <p className="text-3xl font- text-white">{stats.watchlist}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 group-hover:scale-110 transition-transform">
                <Play size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Watching</p>
                <p className="text-3xl font-medium text-white">
                  {stats.watching}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-medium text-white">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Activity size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white">
                Recent Activity
              </h3>
            </div>
            <div className="mb-4 p-2 bg-red-500/10 rounded text-red-300 text-xs">
              Debug: Library length: {library.length} | Recent activity length:{" "}
              {recentActivity.length}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading recent activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {activity.action}{" "}
                        <span className="text-purple-400">
                          {activity.anime}
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recent activity found</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {library.length > 0
                      ? "Library items found but no recent activity timestamps"
                      : "No library items found"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Settings size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Account Settings
              </h3>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white group">
                <Key
                  size={18}
                  className="text-blue-400 group-hover:scale-110 transition-transform"
                />
                <span>Change Password</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white group">
                <Bell
                  size={18}
                  className="text-green-400 group-hover:scale-110 transition-transform"
                />
                <span>Notification Preferences</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white group">
                <Shield
                  size={18}
                  className="text-yellow-400 group-hover:scale-110 transition-transform"
                />
                <span>Privacy Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 group">
                <Trash2
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage2;
