import express from "express";
import axios from "axios";

const router = express.Router();
const REQUEST_TIMEOUT_MS = 30000;

// Flask API typically exposes /api/recommend/* and /api/health
const PYTHON_RECOMMEND_API_URL =
  process.env.PYTHON_RECOMMEND_API_URL ||
  process.env.PYTHON_API_URL ||
  "http://localhost:5002/api/recommend";
const PYTHON_HEALTH_URL =
  process.env.PYTHON_HEALTH_URL || "http://localhost:5002/api/health";

const getPopularFallback = async (limit = 12) => {
  const { data } = await axios.get("https://api.jikan.moe/v4/top/anime", {
    params: { filter: "bypopularity", limit },
    timeout: 10000,
  });

  return (data.data || []).map((anime, index) => ({
    anime_id: anime.mal_id,
    title: anime.title,
    genres: (anime.genres || []).map((g) => g.name),
    synopsis: anime.synopsis,
    image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    score: anime.score,
    scored_by: anime.scored_by,
    popularity_rank: anime.popularity,
    popularity_score: Math.max(0, 100 - index),
    hybrid_score: Math.max(0.5, 1 - index / Math.max(limit, 1)),
    reason_for_recommendation: "Popular fallback recommendation",
  }));
};

const getSimilarFallback = async (animeId, limit = 6) => {
  const { data } = await axios.get(
    `https://api.jikan.moe/v4/anime/${animeId}/recommendations`,
    {
      params: { limit },
      timeout: 10000,
    }
  );

  return (data.data || []).slice(0, limit).map((item) => ({
    anime_id: item.entry?.mal_id,
    title: item.entry?.title,
    image_url: item.entry?.images?.jpg?.large_image_url || item.entry?.images?.jpg?.image_url,
    content_similarity: Math.min(1, Math.max(0.1, (item.votes || 1) / 100)),
    reason_for_recommendation: item.content || "Recommended by similar viewers",
  }));
};

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { top_n = 12, min_score = 0 } = req.query;

    const response = await axios.get(`${PYTHON_RECOMMEND_API_URL}/user/${userId}`, {
      params: {
        top_n: Number.parseInt(top_n, 10),
        min_score: Number.parseFloat(min_score),
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    return res.json({
      success: true,
      user_id: response.data.user_id,
      recommendations: response.data.recommendations || [],
      count: response.data.count || 0,
      is_cold_start: response.data.is_cold_start || false,
      source: "ml-service",
      message: "Recommendations fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.message);

    // Graceful fallback: still return recommendations instead of hard-failing.
    try {
      const fallbackRecommendations = await getPopularFallback(
        Number.parseInt(req.query.top_n || 12, 10)
      );

      return res.status(200).json({
        success: true,
        user_id: req.params.userId,
        recommendations: fallbackRecommendations,
        count: fallbackRecommendations.length,
        is_cold_start: true,
        source: "fallback-jikan",
        warning:
          "Recommendation service unavailable. Showing popular anime instead.",
      });
    } catch (fallbackError) {
      console.error("❌ Fallback recommendations failed:", fallbackError.message);
      return res.status(503).json({
        success: false,
        error:
          "Recommendation service is currently unavailable and fallback failed.",
        recommendations: [],
      });
    }
  }
});

router.get("/similar/:animeId", async (req, res) => {
  try {
    const { animeId } = req.params;
    const { top_n = 6 } = req.query;

    const response = await axios.get(
      `${PYTHON_RECOMMEND_API_URL}/similar/${animeId}`,
      {
        params: {
          top_n: Number.parseInt(top_n, 10),
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

    try {
      const fallbackSimilar = await getSimilarFallback(
        req.params.animeId,
        Number.parseInt(req.query.top_n || 6, 10)
      );

      return res.json({
        success: true,
        anime_id: req.params.animeId,
        similar: fallbackSimilar,
        count: fallbackSimilar.length,
        source: "fallback-jikan",
        warning:
          "Recommendation service unavailable. Showing Jikan similar anime fallback.",
      });
    } catch (fallbackError) {
      return res.status(503).json({
        success: false,
        error: "Failed to fetch similar anime",
        details: fallbackError.message,
        similar: [],
      });
    }
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
