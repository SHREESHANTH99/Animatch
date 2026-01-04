import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RecommendationCard = ({ anime, rank }) => {
  const navigate = useNavigate();

  // Debug logging
  console.log(`🎴 RecommendationCard #${rank}:`, {
    title: anime.title,
    image_url: anime.image_url,
    image_url_type: typeof anime.image_url,
    image_url_length: anime.image_url?.length,
  });

  const handleClick = () => {
    navigate(`/anime/${anime.anime_id}`);
  };

  // Parse genres if it's a string
  const genres =
    typeof anime.genres === "string"
      ? anime.genres
          .split(",")
          .map((g) => g.trim())
          .slice(0, 3)
      : Array.isArray(anime.genres)
      ? anime.genres.slice(0, 3)
      : [];

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 0.8) return "from-green-500 to-emerald-600";
    if (score >= 0.6) return "from-blue-500 to-cyan-600";
    if (score >= 0.4) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  // Render match percentage badge
  const matchPercentage = Math.round(
    (anime.hybrid_score || anime.content_similarity || 0) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-700 hover:border-purple-500"
      onClick={handleClick}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-lg">
          #{rank}
        </div>
      </div>

      {/* Match Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`bg-gradient-to-br ${getScoreColor(
            anime.hybrid_score || anime.content_similarity || 0
          )} text-white font-semibold rounded-full px-3 py-1 shadow-lg text-sm`}
        >
          {matchPercentage}% Match
        </div>
      </div>

      {/* Anime Image */}
      <div className="relative h-80 overflow-hidden">
        {anime.image_url ? (
          <img
            src={anime.image_url}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {anime.title}
        </h3>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-3">
          {genres.map((genre, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-purple-900 to-blue-900 text-purple-200 text-xs font-medium px-3 py-1 rounded-full border border-purple-700"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {anime.hybrid_score && (
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
              <p className="text-gray-400 text-xs">Hybrid Score</p>
              <p className="text-white font-bold text-sm">
                {(anime.hybrid_score * 100).toFixed(0)}%
              </p>
            </div>
          )}
          {anime.content_similarity && (
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
              <p className="text-gray-400 text-xs">Content Match</p>
              <p className="text-white font-bold text-sm">
                {(anime.content_similarity * 100).toFixed(0)}%
              </p>
            </div>
          )}
          {anime.popularity_score && (
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
              <p className="text-gray-400 text-xs">Popularity</p>
              <p className="text-white font-bold text-sm">
                {anime.popularity_score}/100
              </p>
            </div>
          )}
        </div>

        {/* Reason */}
        {anime.reason_for_recommendation && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-purple-700/50">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-purple-400 font-semibold">💡 Why: </span>
              {anime.reason_for_recommendation}
            </p>
          </div>
        )}

        {/* Synopsis Preview */}
        {anime.synopsis && (
          <div className="mt-3">
            <p className="text-gray-400 text-sm line-clamp-2">
              {anime.synopsis}
            </p>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <div className="px-5 pb-5">
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-lg">
          View Details →
        </button>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
