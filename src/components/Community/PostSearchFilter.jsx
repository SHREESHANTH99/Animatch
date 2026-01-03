import React, { useState } from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  User,
  Hash,
  TrendingUp,
} from "lucide-react";

const PostSearchFilter = ({ onSearch, onFilter, totalPosts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    sortBy: "recent",
    timeRange: "all",
    hasImages: false,
    hasComments: false,
    author: "",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery, filters);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      sortBy: "recent",
      timeRange: "all",
      hasImages: false,
      hasComments: false,
      author: "",
    });
    onSearch("", {
      sortBy: "recent",
      timeRange: "all",
      hasImages: false,
      hasComments: false,
      author: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && v !== "recent" && v !== "all"
  ).length;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/10">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, users, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <Filter size={18} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </form>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="bg-black/20 rounded-xl p-4 border border-white/10 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Filter size={16} />
              Advanced Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm text-white/80 mb-2 flex items-center gap-2">
                <TrendingUp size={14} />
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="recent" className="bg-gray-800">
                  Most Recent
                </option>
                <option value="popular" className="bg-gray-800">
                  Most Popular
                </option>
                <option value="comments" className="bg-gray-800">
                  Most Discussed
                </option>
                <option value="oldest" className="bg-gray-800">
                  Oldest First
                </option>
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm text-white/80 mb-2 flex items-center gap-2">
                <Calendar size={14} />
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters({ ...filters, timeRange: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all" className="bg-gray-800">
                  All Time
                </option>
                <option value="today" className="bg-gray-800">
                  Today
                </option>
                <option value="week" className="bg-gray-800">
                  This Week
                </option>
                <option value="month" className="bg-gray-800">
                  This Month
                </option>
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm text-white/80 mb-2 flex items-center gap-2">
                <User size={14} />
                Author Username
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) =>
                  setFilters({ ...filters, author: e.target.value })
                }
                placeholder="Filter by author..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Content Type Filters */}
            <div>
              <label className="block text-sm text-white/80 mb-2">
                Content Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/70 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.hasImages}
                    onChange={(e) =>
                      setFilters({ ...filters, hasImages: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500/50"
                  />
                  <span className="text-sm">Has Images</span>
                </label>
                <label className="flex items-center gap-2 text-white/70 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.hasComments}
                    onChange={(e) =>
                      setFilters({ ...filters, hasComments: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500/50"
                  />
                  <span className="text-sm">Has Comments</span>
                </label>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleSearch}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-white/60">
          {totalPosts} post{totalPosts !== 1 ? "s" : ""} found
        </span>
        {(searchQuery || activeFiltersCount > 0) && (
          <button
            onClick={resetFilters}
            className="text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default PostSearchFilter;
