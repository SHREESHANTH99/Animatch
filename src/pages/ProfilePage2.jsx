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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-gray-400 text-sm">Your anime journey at a glance</p>
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl -z-10 group-hover:blur-2xl transition-all duration-300"></div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-4">
                {user.user_metadata?.full_name || user?.username}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Mail size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Email</p>
                    <p className="text-white text-sm">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calendar size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium">Member Since</p>
                    <p className="text-white text-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-110 transition-transform shadow-lg">
                <Eye size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Plan to Watch</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats.watchlist}
                </p>
                <p className="text-gray-500 text-xs">anime in watchlist</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 group-hover:scale-110 transition-transform shadow-lg">
                <Play size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Currently Watching</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats.watching}
                </p>
                <p className="text-gray-500 text-xs">ongoing series</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {stats.completed}
                </p>
                <p className="text-gray-500 text-xs">anime finished</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
              <p className="text-gray-400 text-sm">Your latest anime updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400">Loading recent activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="grid gap-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">
                        {activity.action}{" "}
                        <span className="text-purple-400 font-semibold">
                          {activity.anime}
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity size={24} className="text-purple-400" />
                </div>
                <p className="text-gray-400 text-lg mb-2">No recent activity</p>
                <p className="text-gray-500 text-sm">Start adding anime to your library to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;