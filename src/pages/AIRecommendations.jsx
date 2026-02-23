import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import RecommendationCard from "../components/Recommendations/RecommendationCard";
import api from "../utils/api";

const AIRecommendations = () => {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    topN: 12,
    minScore: 0,
  });

  useEffect(() => {
    console.log("🔍 AIRecommendations useEffect:", {
      authLoading,
      hasUser: !!user,
      userId: user?._id || user?.id,
      userKeys: user ? Object.keys(user) : [],
    });

    // Wait for auth to complete and user to exist
    if (!authLoading && user) {
      // Use _id if available, otherwise try id field
      const userId = user._id || user.id;
      if (userId) {
        console.log("✅ Auth ready, fetching recommendations for:", userId);
        fetchRecommendations();
      } else {
        console.warn("⚠️ User object exists but has no _id or id field:", user);
        setLoading(false);
        setError("User ID not found. Please refresh the page.");
      }
    } else if (!authLoading && !user) {
      console.log("ℹ️ No user logged in");
      setLoading(false);
    }
  }, [user?._id, user?.id, authLoading, filters]);

  const fetchRecommendations = async () => {
    let timeoutId;
    try {
      setLoading(true);
      setError(null);

      const userId = user._id || user.id;
      console.log("🤖 Fetching AI recommendations for user:", userId);

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await api.get(`/recommendations/user/${userId}`, {
        params: {
          top_n: filters.topN,
          min_score: filters.minScore,
        },
        signal: controller.signal,
      });


      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        throw new Error(
          response.data.error ||
            response.data.message ||
            "Failed to fetch recommendations"
        );
      }
    } catch (err) {
      console.error("❌ Error fetching recommendations:", err);
      console.error("Error details:", err.response?.data);

      // Handle timeout
      if (err.name === "AbortError" || err.code === "ECONNABORTED") {
        setError(
          "Request timed out. The recommendation system is taking too long. Please try again."
        );
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Failed to load recommendations. Please try again later."
        );
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-300 mb-6">
            Please login to get personalized anime recommendations
          </p>
          <a
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            🤖 AI Recommendations
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Personalized anime suggestions powered by machine learning
            algorithms based on your viewing history and preferences
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Number of Results
                </label>
                <select
                  value={filters.topN}
                  onChange={(e) =>
                    setFilters({ ...filters, topN: parseInt(e.target.value) })
                  }
                  className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value={6}>6 Anime</option>
                  <option value={12}>12 Anime</option>
                  <option value={24}>24 Anime</option>
                  <option value={50}>50 Anime</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Minimum Match Score
                </label>
                <select
                  value={filters.minScore}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minScore: parseFloat(e.target.value),
                    })
                  }
                  className="bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value={0}>All (0%)</option>
                  <option value={0.3}>30% and above</option>
                  <option value={0.5}>50% and above</option>
                  <option value={0.7}>70% and above</option>
                  <option value={0.9}>90% and above</option>
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>🔄</span>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <p className="text-purple-200 text-sm">
              <span className="font-semibold">💡 How it works:</span> Our AI
              analyzes your library, favorites, and watch history using TF-IDF
              vectorization and cosine similarity to find anime that match your
              taste. The hybrid score combines content similarity (60%) with
              popularity (40%).
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-white text-xl">Analyzing your preferences...</p>
            <p className="text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Recommendations Yet
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Start watching anime and add them to your library to get
              personalized recommendations!
            </p>
            <a
              href="/discover"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Explore Anime
            </a>
          </motion.div>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-white">
                Found {recommendations.length} perfect matches for you
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((anime, index) => (
                <RecommendationCard
                  key={anime.anime_id}
                  anime={anime}
                  rank={index + 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
