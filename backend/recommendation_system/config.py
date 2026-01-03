"""
config.py
Configuration Settings for Recommendation System
"""

import os

class Config:
    """Configuration class for recommendation system."""

    # Model parameters
    MAX_FEATURES = 5000  # Maximum TF-IDF features
    MIN_DF = 1  # Minimum document frequency
    MAX_DF = 0.8  # Maximum document frequency (ignore very common terms)
    NGRAM_RANGE = (1, 2)  # Use unigrams and bigrams

    # Scoring weights
    CONTENT_WEIGHT = 0.6  # Weight for content similarity
    POPULARITY_WEIGHT = 0.4  # Weight for popularity

    # Interaction weights
    INTERACTION_WEIGHTS = {
        'favorite': 3.0,
        'like': 2.0,
        'view': 1.0
    }

    # Cold-start threshold
    COLD_START_THRESHOLD = 3  # Minimum interactions to not be cold-start

    # Recommendation parameters
    DEFAULT_TOP_N = 10  # Default number of recommendations
    MAX_TOP_N = 50  # Maximum recommendations allowed

    # Diversity
    ENABLE_DIVERSITY = True  # Enable genre diversity
    DIVERSITY_FACTOR = 0.2  # Diversity strength (0-1)

    # File paths
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'models', 'anime_model.pkl')
    DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

    # API settings
    API_HOST = '0.0.0.0'
    API_PORT = 5001
    DEBUG_MODE = False

    # Database connection (if using database instead of CSV)
    # These would be loaded from environment variables in production
    DATABASE_URL = os.environ.get('DATABASE_URL', None)
    MONGODB_URI = os.environ.get('MONGODB_URI', None)

    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'recommendation_system.log'

    @classmethod
    def validate(cls):
        """Validate configuration settings."""
        assert 0 <= cls.CONTENT_WEIGHT <= 1, "CONTENT_WEIGHT must be between 0 and 1"
        assert 0 <= cls.POPULARITY_WEIGHT <= 1, "POPULARITY_WEIGHT must be between 0 and 1"
        assert abs((cls.CONTENT_WEIGHT + cls.POPULARITY_WEIGHT) - 1.0) < 0.01, \
            "CONTENT_WEIGHT + POPULARITY_WEIGHT must equal 1.0"
        assert cls.MAX_FEATURES > 0, "MAX_FEATURES must be positive"
        assert cls.COLD_START_THRESHOLD >= 0, "COLD_START_THRESHOLD must be non-negative"


# Validate config on import
Config.validate()
