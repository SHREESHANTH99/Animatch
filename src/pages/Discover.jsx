import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Star,
  Calendar,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, Links } from "react-router-dom";

const Discover = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    rating: "",
    genre: "",
    orderBy: "popularity",
    sort: "asc",
    minScore: "",
    year: "",
  });
  const [lastRequestTime, setLastRequestTime] = useState(0);
  // const [requestQueue, setRequestQueue] = useState([]);
  // const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const RATE_LIMIT_DELAY = 1000;

  const makeRateLimitedRequest = useCallback(
    async (url) => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
        );
      }

      setLastRequestTime(Date.now());

      try {
        const response = await fetch(url);
        if (response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return await fetch(url);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    [lastRequestTime]
  );
  const searchAnime = useCallback(
    async (page = 1, resetResults = true) => {
      setLoading(true);
      setError(null);

      try {
        let url = `https://api.jikan.moe/v4/anime?page=${page}&limit=20`;

        if (searchQuery.trim()) {
          url += `&q=${encodeURIComponent(searchQuery.trim())}`;
        }

        if (filters.type) url += `&type=${filters.type}`;
        if (filters.status) url += `&status=${filters.status}`;
        if (filters.rating) url += `&rating=${filters.rating}`;
        if (filters.genre) url += `&genres=${filters.genre}`;
        if (filters.orderBy) url += `&order_by=${filters.orderBy}`;
        if (filters.sort) url += `&sort=${filters.sort}`;
        if (filters.minScore) url += `&min_score=${filters.minScore}`;
        if (filters.year)
          url += `&start_date=${filters.year}-01-01&end_date=${filters.year}-12-31`;

        const response = await makeRateLimitedRequest(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (resetResults) {
          setAnime(data.data || []);
        } else {
          setAnime((prev) => [...prev, ...(data.data || [])]);
        }

        setHasNextPage(data.pagination?.has_next_page || false);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message);
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filters, makeRateLimitedRequest]
  );
  const loadMore = () => {
    if (hasNextPage && !loading) {
      searchAnime(currentPage + 1, false);
    }
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || Object.values(filters).some((filter) => filter)) {
        searchAnime(1, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  useEffect(() => {
    searchAnime(1, true);
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      rating: "",
      genre: "",
      orderBy: "popularity",
      sort: "asc",
      minScore: "",
      year: "",
    });
    setSearchQuery("");
  };

  const formatScore = (score) => {
    return score ? score.toFixed(1) : "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  return (

    <div className="min-h-screen  bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-cyan-400 bg-clip-text text-transparent mb-2 font-serif">
            Anime Discovery
          </h1>
          <p className="text-purple-400">
            Discover your next favorite anime with advanced search
          </p>
        </div>
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime titles..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="max-w-4xl mx-auto mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-white/10 border border-white/20 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="tv">TV</option>
                  <option value="movie">Movie</option>
                  <option value="ova">OVA</option>
                  <option value="special">Special</option>
                  <option value="ona">ONA</option>
                  <option value="music">Music</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="airing">Airing</option>
                  <option value="complete">Complete</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Ratings</option>
                  <option value="g">G - All Ages</option>
                  <option value="pg">PG - Children</option>
                  <option value="pg13">PG-13 - Teens 13+</option>
                  <option value="r17">R - 17+</option>
                  <option value="r">R+ - Mild Nudity</option>
                  <option value="rx">Rx - Hentai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order By
                </label>
                <select
                  value={filters.orderBy}
                  onChange={(e) =>
                    handleFilterChange("orderBy", e.target.value)
                  }
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="score">Score</option>
                  <option value="start_date">Start Date</option>
                  <option value="end_date">End Date</option>
                  <option value="episodes">Episodes</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minScore}
                  onChange={(e) =>
                    handleFilterChange("minScore", e.target.value)
                  }
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 7.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  min="1960"
                  max="2030"
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">Error: {error}</span>
          </div>
        )}
        {loading && anime.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-300">Loading anime...</span>
          </div>
        )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {anime.map((item) => (
               <Link to={`/anime/${item.mal_id}`} className="block">
              <div
                key={item.mal_id}
                className="bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:bg-white/20 transition-colors group"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                  
                    src={
                      item.images?.jpg?.large_image_url ||
                      item.images?.jpg?.image_url
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjNEY0RjRGIi8+CjxwYXRoIGQ9Ik0xMDAgMTMzLjVMMTAwIDEzMy41WiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0cHgiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
                    }}
                  />
                  {item.score && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-sm">{formatScore(item.score)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-white mb-2 line-clamp-2"
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.aired?.from)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{item.episodes || "N/A"} episodes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{item.type || "N/A"}</span>
                    </div>
                  </div>
                  {item.genres && item.genres.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre.mal_id}
                          className="px-2 py-1 bg-purple-600/50 text-xs text-white rounded"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.synopsis && (
                    <p
                      className="mt-3 text-xs text-gray-400 line-clamp-3"
                      title={item.synopsis}
                    >
                      {item.synopsis}
                    </p>
                  )}
                </div>
              </div></Link>
            ))}
          </div>
        {anime.length > 0 && hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
        {!loading && anime.length === 0 && (
          <div className="text-center py-12">
            <p className="text-red-300 text-lg">
              No anime found matching your criteria.
            </p>
            <p className="text-red-400 mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>

  );
};

export default Discover;
