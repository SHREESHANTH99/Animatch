import React from "react";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Settings,
  Eye,
  Star,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
const ProfilePage2 = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)] relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mt-4">
          <div className="text-3xl bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg font-bold">
            Profile
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30 ">
            <LogOut size={20} />
            Logout
          </button>
        </div>
        <div className="h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
          <div className="flex items-center  gap-6 md:flex-row flex-col mb-6">
            <div className="w-24 h-24  bg-gradient-to-r from-indigo-500 to-purple-600  rounded-full flex items-center justify-center">
              <User size={36}/>
            </div>
            <div>
              <div className="flex items-center justify-center text-3xl text-white font-semibold">
                {user.user_metadata?.full_name || user?.username}
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Mail size={20} />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Calendar size={20} />
                Account created on:{" "}
                {new Date(user?.createdAt || user.created_at).toLocaleDateString("en-IN",{
                  year:"numeric",
                  month: "long",
                  day:"numeric"
                })}
              </div>
            </div>
            <div className="md:ml-auto flex justify-center items-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                <Settings size={20} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        <div className=" grid md:grid-cols-3 grid-cols-1 gap-4 mb-8 mt-8">
          <div className=" flex items-center gap-6 h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <Eye size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-400">Watchlist</div>
              <div className="text-yellow-500 text-2xl">7</div>
            </div>
            <div></div>
          </div>
          <div className=" flex items-center gap-6 h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <Star size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-400">Ratings</div>
              <div className="text-yellow-500 text-2xl">12</div>
            </div>
            <div></div>
          </div>
          <div className=" flex items-center gap-6 h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <Heart size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-400"> Favorites</div>
              <div className="text-yellow-500 text-2xl">67</div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1   mb-8 mt-8">
          <div className="flex flex-col items-center gap-4 h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
          <h1 className="text-xl text-white/80 font-semibold">Recent Activity</h1>
          </div>
          <div className="flex flex-col items-center gap-4 h-auto mx-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg mt-4 px-4 py-8 rounded-2xl">
          <h1 className="text-xl text-white/80 font-semibold">Account Settings</h1>
          <div className="space-y-3">
                <button className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/70">
                  Change Password
                </button>
                <button className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/70">
                  Notification Preferences
                </button>
                <button className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/70">
                  Privacy Settings
                </button>
                <button className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-red-400">
                  Delete Account
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage2;
