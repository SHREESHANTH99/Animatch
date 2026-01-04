import express from "express";
import axios from "axios";

const router = express.Router();

// Configuration for Python Flask API
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://localhost:5002/api/recommend";

/**
 * @route   GET /api/recommendations/user/:userId
 * @desc    Get personalized recommendations for a user
 * @access  Private
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { top_n = 12, min_score = 0 } = req.query;

    console.log(`🤖 Fetching recommendations for user: ${userId}`);

    // Call Python Flask API
    const response = await axios.get(`${PYTHON_API_URL}/user/${userId}`, {
      params: {
        top_n: parseInt(top_n),
      },
      timeout: 30000, // 30 second timeout
    });

    console.log(
      `✅ Received ${
        response.data.recommendations?.length || 0
      } recommendations`
    );

    return res.json({
      success: true,
      user_id: response.data.user_id,
      recommendations: response.data.recommendations || [],
      count: response.data.count || 0,
      is_cold_start: response.data.is_cold_start || false,
      message: "Recommendations fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.message);
    console.error("Error details:", error.response?.data);

    // Handle different error scenarios
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error:
          "Recommendation service is currently unavailable. Please try again later.",
        recommendations: [],
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: "No recommendations found. Try watching more anime first!",
        recommendations: [],
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || "Failed to fetch recommendations",
      recommendations: [],
    });
  }
});

/**
 * @route   GET /api/recommendations/similar/:animeId
 * @desc    Get anime similar to a specific anime
 * @access  Public
 */
router.get("/similar/:animeId", async (req, res) => {
  try {
    const { animeId } = req.params;
    const { top_n = 6 } = req.query;

    console.log(`🔍 Fetching similar anime for ID: ${animeId}`);

    // Call Python Flask API
    const response = await axios.get(`${PYTHON_API_URL}/similar/${animeId}`, {
      params: {
        top_n: parseInt(top_n),
      },
      timeout: 30000,
    });

    console.log(
      `✅ Received ${response.data.similar?.length || 0} similar anime`
    );

    return res.json({
      success: true,
      anime_id: response.data.anime_id,
      similar: response.data.similar || [],
      count: response.data.count || 0,
      message: "Similar anime fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching similar anime:", error.message);
    console.error("Error details:", error.response?.data);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "Recommendation service is currently unavailable",
        similar: [],
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: "Anime not found in recommendation system",
        similar: [],
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || "Failed to fetch similar anime",
      similar: [],
    });
  }
});

/**
 * @route   POST /api/recommendations/initialize
 * @desc    Initialize/refresh the recommendation system
 * @access  Private (Admin only)
 */
router.post("/initialize", async (req, res) => {
  try {
    // Call Python Flask API to reinitialize
    const response = await axios.post(
      `${PYTHON_API_URL}/initialize`,
      {},
      {
        timeout: 60000, // 60 second timeout for initialization
      }
    );

    return res.json({
      success: true,
      message:
        response.data.message ||
        "Recommendation system initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing recommendation system:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to initialize recommendation system",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/recommendations/health
 * @desc    Check health status of recommendation service
 * @access  Public
 */
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/health`, {
      timeout: 5000,
    });

    return res.json({
      success: true,
      status: "healthy",
      service: response.data,
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
