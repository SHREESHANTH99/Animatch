import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const SimilarAnime = ({ animeId, currentAnimeTitle }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (animeId) {
      fetchSimilarAnime();
    }
  }, [animeId]);

  const fetchSimilarAnime = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/recommendations/similar/${animeId}`, {
        params: { top_n: 6 },
      });

      if (response.data.success) {
        setSimilar(response.data.similar);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch similar anime"
        );
      }
    } catch (err) {
      console.error("Error fetching similar anime:", err);
      setError(err.response?.data?.message || "Failed to load similar anime");
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = (id) => {
    navigate(`/anime/${id}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">Similar Anime</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">Similar Anime</h3>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-200 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          🔍 Similar to {currentAnimeTitle}
        </h3>
        <div className="text-sm text-gray-400">Powered by AI</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similar.map((anime, index) => {
          const genres =
            typeof anime.genres === "string"
              ? anime.genres
                  .split(",")
                  .map((g) => g.trim())
                  .slice(0, 2)
              : Array.isArray(anime.genres)
              ? anime.genres.slice(0, 2)
              : [];

          const matchPercentage = Math.round(
            (anime.content_similarity || 0) * 100
          );

          return (
            <motion.div
              key={anime.anime_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-purple-500"
              onClick={() => handleAnimeClick(anime.anime_id)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {anime.image_url ? (
                  <img
                    src={anime.image_url}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}

                {/* Match Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow-lg">
                  {matchPercentage}% Match
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {anime.title}
                </h4>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-700"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reason */}
                {anime.reason_for_recommendation && (
                  <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                    {anime.reason_for_recommendation}
                  </p>
                )}

                {/* View Button */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold py-2 rounded transition-all duration-300">
                  View Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/ai-recommendations")}
          className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-700"
        >
          View All AI Recommendations →
        </button>
      </div>
    </div>
  );
};

export default SimilarAnime;
