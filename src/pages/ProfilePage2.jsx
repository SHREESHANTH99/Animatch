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
  X,
  Save,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import apiInstance from "../utils/api.js";
import axios from "axios";

const ProfilePage2 = () => {
  const { user, logout, setUser} = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setEditForm({
        username: user.user_metadata?.full_name || user?.username || "",
        email: user?.email || "",
      });
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
    if (!library || library.length === 0) {
      return [];
    }

    const itemsWithTimestamps = library.filter(
      (anime) =>
        anime.updated_at ||
        anime.created_at ||
        anime.createdAt ||
        anime.updatedAt
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
      return dateB - dateA;
    });

    const recentItems = sortedItems.slice(0, 5);

    return recentItems.map((anime) => ({
      id: anime.id || anime._id || anime.animeId,
      anime: anime.title,
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

const handleEditProfile = async (e) => {
  e.preventDefault();
  setUpdateLoading(true);
  const token = localStorage.getItem("token");
  
  try {
    console.log("Updating profile...");

    await axios.patch(
      `${process.env.REACT_APP_API_URL}/api/user/edit`,
      editForm,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const updatedUserData = {
      ...user,
      username: editForm.username,
      email: editForm.email,
      user_metadata: {
        ...user.user_metadata,
        full_name: editForm.username,
      },
    };
 
    setUser(updatedUserData);
    
    console.log("Profile updated successfully!");
    alert("Profile updated successfully!");
    setShowEditModal(false);
    
  } catch (error) {
    console.error("Profile update error:", error);
    alert(error.response?.data?.message || "Failed to update profile");
  } finally {
    setUpdateLoading(false);
  }
};

const handleChangePassword = async (e) => {
  e.preventDefault();

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert("New passwords don't match!");
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    alert("New password must be at least 6 characters long!");
    return;
  }

  setPasswordLoading(true);
  const token = localStorage.getItem("token");

  try {
    console.log("=== PASSWORD CHANGE ATTEMPT ===");
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log("Full URL:", `${process.env.REACT_APP_API_URL}/api/user/change-password`);
    console.log("Token exists:", !!token);
    console.log("Current password length:", passwordForm.currentPassword.length);
    console.log("New password length:", passwordForm.newPassword.length);

    const requestData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    };

    console.log("Request payload:", requestData);

    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/api/user/change-password`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log("✅ SUCCESS!");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });

  } catch (error) {
    console.log("❌ PASSWORD CHANGE FAILED");
    console.log("Error type:", error.constructor.name);
    console.log("Error message:", error.message);
    
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log("Response data:", error.response.data);
      console.log("Response headers:", error.response.headers);
    } else if (error.request) {
      console.log("No response received");
      console.log("Request:", error.request);
    } else {
      console.log("Request setup error:", error.message);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      alert("Cannot connect to server. Please check if your backend is running.");
    } 
    else if (error.code === 'ECONNABORTED') {
      alert("Request timeout. Please try again.");
    }
    else if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Unknown error";
      
      if (status === 401) {
        alert(`Incorrect current password: ${message}`);
      } else if (status === 404) {
        alert("Password change endpoint not found. Please contact support.");
      } else if (status === 500) {
        alert(`Server error: ${message}`);
      } else {
        alert(`Error (${status}): ${message}`);
      }
    } else {
      alert("An unexpected error occurred. Check the console for details.");
    }
    
  } finally {
    setPasswordLoading(false);
  }
};

const handleDeleteAccount = async () => {
  if (deleteConfirmation !== "DELETE") {
    alert("Please type 'DELETE' to confirm account deletion");
    return;
  }

  setDeleteLoading(true);
  const token = localStorage.getItem("token"); 

  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert("Account deleted successfully");
    logout();
  } catch (error) {
    console.error("Account deletion error:", error);
    alert(error.response?.data?.message || "Failed to delete account");
  } finally {
    setDeleteLoading(false);
  }
};


  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({
      username: user.user_metadata?.full_name || user?.username || "",
      email: user?.email || "",
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation("");
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
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 group"
              >
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
                <p className="text-3xl font-bold text-white">
                  {stats.watchlist}
                </p>
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
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white group"
              >
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
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 group"
              >
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateLoading ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save size={16} />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Change Password</h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    "Changing..."
                  ) : (
                    <>
                      <Key size={16} />
                      Change
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-red-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-400">
                Delete Account
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-300 text-sm">
                  ⚠️ This action is irreversible. All your data, including your
                  anime library, will be permanently deleted.
                </p>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Type DELETE to confirm"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== "DELETE"}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage2;
