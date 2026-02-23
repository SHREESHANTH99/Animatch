import express from "express";
import axios from "axios";
import { verifyToken } from "../middleware/authMiddlesware.js";

const router = express.Router();
const REQUEST_TIMEOUT_MS = 30000;

const PYTHON_RECOMMEND_API_URL =
  process.env.PYTHON_RECOMMEND_API_URL ||
  process.env.PYTHON_API_URL ||
  "http://localhost:5002/api/recommend";

const PYTHON_HEALTH_URL =
  process.env.PYTHON_HEALTH_URL || "http://localhost:5002/api/health";

const STATIC_FALLBACK_RECOMMENDATIONS = [
  {
    anime_id: 5114,
    title: "Fullmetal Alchemist: Brotherhood",
    genres: ["Action", "Adventure", "Drama"],
    image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg",
    score: 9.1,
  },
  {
    anime_id: 9253,
    title: "Steins;Gate",
    genres: ["Sci-Fi", "Thriller"],
    image_url: "https://cdn.myanimelist.net/images/anime/1935/127974.jpg",
    score: 9.0,
  },
  {
    anime_id: 1535,
    title: "Death Note",
    genres: ["Mystery", "Psychological", "Supernatural"],
    image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    score: 8.6,
  },
  {
    anime_id: 16498,
    title: "Attack on Titan",
    genres: ["Action", "Drama", "Fantasy"],
    image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    score: 8.5,
  },
  {
    anime_id: 11061,
    title: "Hunter x Hunter (2011)",
    genres: ["Action", "Adventure", "Fantasy"],
    image_url: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
    score: 9.0,
  },
  {
    anime_id: 20,
    title: "Naruto",
    genres: ["Action", "Adventure", "Shounen"],
    image_url: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    score: 8.0,
  },
];

let popularFallbackCache = {
  data: null,
  expiresAt: 0,
};

const buildStaticFallback = (limit = 12) =>
  STATIC_FALLBACK_RECOMMENDATIONS.slice(0, limit).map((anime, index) => ({
    ...anime,
    popularity_score: Math.max(0, 100 - index),
    hybrid_score: Math.max(0.55, 1 - index / Math.max(limit, 1)),
    reason_for_recommendation: "Reliable fallback recommendation",
  }));

const getPopularFallback = async (limit = 12) => {
  const now = Date.now();
  if (popularFallbackCache.data && popularFallbackCache.expiresAt > now) {
    return popularFallbackCache.data.slice(0, limit);
  }

  try {
    const { data } = await axios.get("https://api.jikan.moe/v4/top/anime", {
      params: { filter: "bypopularity", limit: Math.max(limit, 12) },
      timeout: 8000,
    });

    const mapped = (data.data || []).map((anime, index) => ({
      anime_id: anime.mal_id,
      title: anime.title,
      genres: (anime.genres || []).map((g) => g.name),
      synopsis: anime.synopsis,
      image_url:
        anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      score: anime.score,
      scored_by: anime.scored_by,
      popularity_rank: anime.popularity,
      popularity_score: Math.max(0, 100 - index),
      hybrid_score: Math.max(0.5, 1 - index / Math.max(limit, 1)),
      reason_for_recommendation: "Popular fallback recommendation",
    }));

    if (!mapped.length) {
      return buildStaticFallback(limit);
    }

    popularFallbackCache = {
      data: mapped,
      expiresAt: now + 10 * 60 * 1000,
    };

    return mapped.slice(0, limit);
  } catch {
    return buildStaticFallback(limit);
  }
};

const getSimilarFallback = async (animeId, limit = 6) => {
  try {
    const { data } = await axios.get(
      `https://api.jikan.moe/v4/anime/${animeId}/recommendations`,
      {
        params: { limit },
        timeout: 8000,
      }
    );

    const mapped = (data.data || []).slice(0, limit).map((item) => ({
      anime_id: item.entry?.mal_id,
      title: item.entry?.title,
      image_url:
        item.entry?.images?.jpg?.large_image_url ||
        item.entry?.images?.jpg?.image_url,
      content_similarity: Math.min(1, Math.max(0.1, (item.votes || 1) / 100)),
      reason_for_recommendation:
        item.content || "Recommended by similar viewers",
    }));

    if (mapped.length) {
      return mapped;
    }
  } catch {
    // no-op and continue to static fallback
  }

  return buildStaticFallback(limit).map((anime) => ({
    anime_id: anime.anime_id,
    title: anime.title,
    image_url: anime.image_url,
    content_similarity: anime.hybrid_score,
    reason_for_recommendation: "Similar taste fallback recommendation",
  }));
};

router.get("/user/:userId", verifyToken, async (req, res) => {
  const requestedUserId = req.params.userId;
  const tokenUserId = req.user?.id;
  const effectiveUserId = tokenUserId || requestedUserId;

  try {
    const { top_n = 12, min_score = 0 } = req.query;
    const parsedTopN = Number.parseInt(top_n, 10) || 12;
    const parsedMinScore = Number.parseFloat(min_score) || 0;

    const response = await axios.get(
      `${PYTHON_RECOMMEND_API_URL}/user/${effectiveUserId}`,
      {
        params: {
          top_n: parsedTopN,
          min_score: parsedMinScore,
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    return res.json({
      success: true,
      user_id: response.data.user_id || effectiveUserId,
      recommendations: response.data.recommendations || [],
      count: response.data.count || 0,
      is_cold_start: response.data.is_cold_start || false,
      source: "ml-service",
      message: "Recommendations fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.message);

    try {
      const parsedTopN = Number.parseInt(req.query.top_n || 12, 10) || 12;
      const parsedMinScore = Number.parseFloat(req.query.min_score || 0) || 0;

      const fallbackRecommendations = (await getPopularFallback(parsedTopN)).filter(
        (anime) => (anime.hybrid_score || 0) >= parsedMinScore
      );

      return res.status(200).json({
        success: true,
        user_id: effectiveUserId,
        recommendations: fallbackRecommendations,
        count: fallbackRecommendations.length,
        is_cold_start: true,
        source: "fallback",
        warning:
          "Recommendation service unavailable. Showing fallback recommendations.",
      });
    } catch (fallbackError) {
      return res.status(503).json({
        success: false,
        error:
          "Recommendation service is currently unavailable and fallback failed.",
        details: fallbackError.message,
        recommendations: [],
      });
    }
  }
});

router.get("/similar/:animeId", async (req, res) => {
  try {
    const { animeId } = req.params;
    const parsedTopN = Number.parseInt(req.query.top_n || 6, 10) || 6;

    const response = await axios.get(
      `${PYTHON_RECOMMEND_API_URL}/similar/${animeId}`,
      {
        params: {
          top_n: parsedTopN,
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    return res.json({
      success: true,
      anime_id: response.data.anime_id,
      similar: response.data.similar || [],
      count: response.data.count || 0,
      source: "ml-service",
      message: "Similar anime fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching similar anime:", error.message);

    const fallbackSimilar = await getSimilarFallback(
      req.params.animeId,
      Number.parseInt(req.query.top_n || 6, 10) || 6
    );

    return res.json({
      success: true,
      anime_id: req.params.animeId,
      similar: fallbackSimilar,
      count: fallbackSimilar.length,
      source: "fallback",
      warning:
        "Recommendation service unavailable. Showing fallback similar anime.",
    });
  }
});

router.post("/initialize", async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_RECOMMEND_API_URL}/initialize`,
      {},
      {
        timeout: 60000,
      }
    );

    return res.json({
      success: true,
      message:
        response.data.message ||
        "Recommendation system initialized successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to initialize recommendation system",
      error: error.message,
    });
  }
});

router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(PYTHON_HEALTH_URL, {
      timeout: 5000,
    });

    return res.json({
      success: true,
      status: "healthy",
      service: response.data,
      endpoint: PYTHON_HEALTH_URL,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: "unhealthy",
      message: "Recommendation service is not responding",
      error: error.code || "SERVICE_UNAVAILABLE",
    });
  }
});

export default router;
