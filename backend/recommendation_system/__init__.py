"""
__init__.py
Recommendation System Package Initialization
"""

from .preprocess import AnimePreprocessor
from .model import AnimeRecommendationModel
from .user_profile import UserProfileBuilder
from .recommender import HybridRecommender
from .config import Config

__version__ = '1.0.0'

__all__ = [
    'AnimePreprocessor',
    'AnimeRecommendationModel',
    'UserProfileBuilder',
    'HybridRecommender',
    'Config'
]
