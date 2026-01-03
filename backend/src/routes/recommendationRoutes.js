import express from "express";
import axios from "axios";

const router = express.Router();

// Configuration for Python Flask API
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://localhost:5000/api/recommend";

/**
 * @route   GET /api/recommendations/user/:userId
 * @desc    Get personalized recommendations for a user
 * @access  Private
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { top_n = 12, min_score = 0 } = req.query;

    // Call Python Flask API
    const response = await axios.get(`${PYTHON_API_URL}/user/${userId}`, {
      params: {
        top_n: parseInt(top_n),
        min_score: parseFloat(min_score),
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data.success) {
      return res.json({
        success: true,
        recommendations: response.data.recommendations,
        message:
          response.data.message || "Recommendations fetched successfully",
      });
    } else {
      throw new Error(
        response.data.message || "Failed to fetch recommendations"
      );
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);

    // Handle different error scenarios
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message:
          "Recommendation service is currently unavailable. Please try again later.",
        error: "SERVICE_UNAVAILABLE",
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "No recommendations found. Try watching more anime first!",
        error: "NO_RECOMMENDATIONS",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch recommendations",
      error: "INTERNAL_ERROR",
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

    // Call Python Flask API
    const response = await axios.get(`${PYTHON_API_URL}/similar/${animeId}`, {
      params: {
        top_n: parseInt(top_n),
      },
      timeout: 30000,
    });

    if (response.data.success) {
      return res.json({
        success: true,
        similar: response.data.similar,
        message: "Similar anime fetched successfully",
      });
    } else {
      throw new Error(response.data.message || "Failed to fetch similar anime");
    }
  } catch (error) {
    console.error("Error fetching similar anime:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "Recommendation service is currently unavailable",
        error: "SERVICE_UNAVAILABLE",
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Anime not found in recommendation system",
        error: "NOT_FOUND",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch similar anime",
      error: "INTERNAL_ERROR",
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
