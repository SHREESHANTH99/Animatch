import React, { useEffect, useState } from "react";
import {
  Play,
  Check,
  X,
  Trash2,
  MoreVertical,
  Star,
  Calendar,
  Clock,
} from "lucide-react";
import apiInstance from "../utils/api";
import { Link } from "react-router-dom";
export default function LibraryPage() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watching");
  const [searchTerm, setSearchTerm] = useState("");

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
    fetchLibrary();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await apiInstance.patch(`/library/${id}`, { status: newStatus });
      setLibrary((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await apiInstance.delete(`/library/${id}`);
      setLibrary((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredLibrary = library.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const watching = filteredLibrary.filter((item) => item.status === "watching");
  const completed = filteredLibrary.filter(
    (item) => item.status === "completed"
  );
  const dropped = filteredLibrary.filter((item) => item.status === "dropped");
  const planned = filteredLibrary.filter((item) => item.status === "planned");

  const tabs = [
    {
      id: "watching",
      label: "Watching",
      count: watching.length,
      icon: Play,
      color: "blue",
    },
    {
      id: "completed",
      label: "Completed",
      count: completed.length,
      icon: Check,
      color: "green",
    },
    {
      id: "dropped",
      label: "Dropped",
      count: dropped.length,
      icon: X,
      color: "red",
    },
    {
      id: "planned",
      label: "Planned",
      count: planned.length,
      icon: Clock,
      color: "purple",
    },
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case "watching":
        return watching;
      case "completed":
        return completed;
      case "dropped":
        return dropped;
      case "planned":
        return planned;
      default:
        return watching;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your anime library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AniMatch Library
          </h1>
          <p className="text-gray-300 text-lg">Track your anime journey</p>
        </div>
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search your anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20 flex flex-wrap justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 m-1 ${
                    isActive
                      ? `bg-${tab.color}-500 text-white shadow-lg`
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      isActive ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <AnimeGrid
          items={getCurrentItems()}
          updateStatus={updateStatus}
          deleteItem={deleteItem}
        />
      </div>
    </div>
  );
}

function AnimeGrid({ items, updateStatus, deleteItem }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📺</div>
        <p className="text-gray-300 text-xl">No anime found in this category</p>
        <p className="text-gray-400 mt-2">
          Start adding some anime to your library!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <AnimeCard
          key={item._id}
          item={item}
          updateStatus={updateStatus}
          deleteItem={deleteItem}
        />
      ))}
    </div>
  );
}

function AnimeCard({ item, updateStatus, deleteItem }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    await updateStatus(item._id, newStatus);
    setIsUpdating(false);
    setShowDropdown(false);
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    await deleteItem(item._id);
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "watching":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "dropped":
        return "bg-red-500";
      case "planned":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative h-96 overflow-hidden">
         <Link to={`/anime/${item.animeId}`} className="block">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
            item.status
          )}`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-current" />
          <span className="text-white text-lg font-semibold">{item.score}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <div className="flex items-center gap-2 text-white text-sm mb-2">
              <Calendar size={14} />
              <span>{item.year}</span>
            </div>
          </div>
        </div></Link>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-gray-300 text-sm">{item.year}</div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isUpdating}
              className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MoreVertical size={16} />
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0  top-full mt-[-180px] mr-9  bg-slate-800 backdrop-blur-sm border border-white/20 rounded-xl py-2 min-w-[140px] z-10 shadow-xl">
                {item.status !== "planned" && (
                  <button
                    onClick={() => handleStatusUpdate("planned")}
                    className="w-full px-4 py-2 text-left text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                  >
                    <Clock size={14} />
                    Planned
                  </button>
                )}
                {item.status !== "watching" && (
                  <button
                    onClick={() => handleStatusUpdate("watching")}
                    className="w-full px-4 py-2 text-left text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                  >
                    <Play size={14} />
                    Watching
                  </button>
                )}
                {item.status !== "completed" && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-2"
                  >
                    <Check size={14} />
                    Completed
                  </button>
                )}
                {item.status !== "dropped" && (
                  <button
                    onClick={() => handleStatusUpdate("dropped")}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <X size={14} />
                    Dropped
                  </button>
                )}
                <hr className="border-white/10 my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
