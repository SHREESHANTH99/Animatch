import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Eye,
  Play,
  BookOpen,
  Activity,
  TrendingUp,
  Star,
  Sparkles,
  Award,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import apiInstance from "../utils/api.js";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const res = await apiInstance.get("/library");
        setLibrary(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching library:", err);
        setError("Failed to fetch library data");
        setLibrary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user]);

  const getStats = () => {
    if (!Array.isArray(library)) {
      return { watchlist: 0, watching: 0, completed: 0 };
    }

    const watchlist = library.filter(
      (anime) => anime?.status === "planned"
    ).length;
    const watching = library.filter(
      (anime) => anime?.status === "watching"
    ).length;
    const completed = library.filter(
      (anime) => anime?.status === "completed"
    ).length;

    return { watchlist, watching, completed };
  };

  const getRecentActivity = () => {
    if (!Array.isArray(library) || library.length === 0) {
      return [];
    }

    const itemsWithTimestamps = library.filter(
      (anime) =>
        anime &&
        (anime.updated_at ||
          anime.created_at ||
          anime.createdAt ||
          anime.updatedAt)
    );

    if (itemsWithTimestamps.length === 0) {
      return [];
    }

    const sortedItems = itemsWithTimestamps.sort((a, b) => {
      const dateA = new Date(
        a.updated_at || a.updatedAt || a.created_at || a.createdAt
      );
      const dateB = new Date(
        b.updated_at || b.updatedAt || b.created_at || b.createdAt
      );
      return dateB.getTime() - dateA.getTime();
    });

    const recentItems = sortedItems.slice(0, 6);

    return recentItems.map((anime) => ({
      id: anime.id || anime._id || anime.animeId || Math.random(),
      anime: anime.title || "Unknown Title",
      action: getActionText(anime.status),
      date: formatDate(
        anime.updated_at ||
          anime.updatedAt ||
          anime.created_at ||
          anime.createdAt
      ),
    }));
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
      
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-6"></div>
          <div className="text-white text-2xl font-light tracking-wide">Loading user data...</div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/8 via-pink-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-400/60 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300">
                <User className="text-white" size={28} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl blur-xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Profile
              </h1>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Your anime journey at a glance
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-400 rounded-2xl hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 border border-red-500/20 hover:border-red-500/40 group backdrop-blur-sm shadow-lg"
          >
            <LogOut
              size={22}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Enhanced Profile Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 mb-10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-500 via-pink-500 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <User size={56} className="text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-3xl blur-2xl -z-10 group-hover:blur-3xl transition-all duration-500"></div>
              
              {/* Status indicator */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">Active</span>
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-6 tracking-wide">
                {user.user_metadata?.full_name || user?.username}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300">
                <div className="flex items-center gap-4 justify-center lg:justify-start group">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Mail size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Email Address</p>
                    <p className="text-white text-base font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center lg:justify-start group">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Calendar size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Member Since</p>
                    <p className="text-white text-base font-medium">
                      {new Date(
                        user?.createdAt || user.created_at
                      ).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:from-white/15 hover:to-white/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 group-hover:scale-110 transition-all duration-500 shadow-2xl relative">
                <Eye size={32} className="text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Plan to Watch</p>
                <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {stats.watchlist}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Star size={12} className="text-yellow-400" />
                  anime in watchlist
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:from-white/15 hover:to-white/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-xl"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 group-hover:scale-110 transition-all duration-500 shadow-2xl relative">
                <Play size={32} className="text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Currently Watching</p>
                <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {stats.watching}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Zap size={12} className="text-green-400" />
                  ongoing series
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:from-white/15 hover:to-white/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 group-hover:scale-110 transition-all duration-500 shadow-2xl relative">
                <BookOpen size={32} className="text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Completed</p>
                <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {stats.completed}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Award size={12} className="text-orange-400" />
                  anime finished
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-10 hover:from-white/15 hover:to-white/10 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl relative overflow-hidden">
              <Activity size={28} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Recent Activity</h3>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Your latest anime updates
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-6"></div>
                <p className="text-gray-300 text-xl">Loading recent activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="grid gap-6">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl hover:from-white/10 hover:to-white/15 transition-all duration-300 border border-white/10 hover:border-white/20 group backdrop-blur-sm"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                      <TrendingUp size={22} className="text-white relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2 text-lg">
                        {activity.action}{" "}
                        <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-bold">
                          {activity.anime}
                        </span>
                      </p>
                      <p className="text-gray-400 flex items-center gap-2">
                        <Calendar size={14} />
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Activity size={28} className="text-purple-400" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
                </div>
                <p className="text-gray-300 text-2xl mb-3 font-semibold">No recent activity</p>
                <p className="text-gray-400 text-lg">Start adding anime to your library to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;