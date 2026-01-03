"""
integration_example.py
Example: Integrating Recommendation System with Node.js Backend

This shows how to load data from MongoDB and expose recommendations
to your Express.js backend.
"""

import os
import sys
from pymongo import MongoClient
import pandas as pd
from datetime import datetime

# Import recommendation system
from preprocess import AnimePreprocessor
from model import AnimeRecommendationModel
from user_profile import UserProfileBuilder
from recommender import HybridRecommender
from config import Config


class AnimeRecommendationService:
    """
    Service class for anime recommendations.
    Integrates with MongoDB database.
    """

    def __init__(self, mongodb_uri: str):
        """
        Initialize the service.

        Args:
            mongodb_uri: MongoDB connection string
        """
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['animatch']  # Your database name

        self.model = None
        self.profile_builder = None
        self.recommender = None
        self.is_initialized = False

    def load_anime_data(self) -> pd.DataFrame:
        """
        Load anime data from MongoDB.

        Returns:
            DataFrame with anime data
        """
        print("📡 Loading anime data from MongoDB...")

        # Adjust collection name as needed
        anime_collection = self.db['animes']  # or 'anime', 'anime_data', etc.

        # Fetch all anime documents
        anime_docs = list(anime_collection.find())

        if not anime_docs:
            raise ValueError("No anime data found in database")

        # Convert to DataFrame
        anime_df = pd.DataFrame(anime_docs)

        # Rename fields if needed to match expected schema
        # Example mapping (adjust based on your schema):
        field_mapping = {
            '_id': 'anime_id',  # MongoDB ObjectId -> anime_id
            'name': 'title',    # or 'title': 'title'
            'genre': 'genres',  # or 'genres': 'genres'
            # Add more mappings as needed
        }

        for old_name, new_name in field_mapping.items():
            if old_name in anime_df.columns and old_name != new_name:
                anime_df[new_name] = anime_df[old_name]

        # Ensure required columns exist
        required_columns = ['anime_id', 'title', 'genres', 'themes', 'synopsis', 'popularity_score']

        for col in required_columns:
            if col not in anime_df.columns:
                if col == 'themes':
                    anime_df['themes'] = ''  # Optional field
                elif col == 'synopsis':
                    anime_df['synopsis'] = anime_df.get('description', '')
                elif col == 'popularity_score':
                    anime_df['popularity_score'] = anime_df.get('rating', 50)  # Default to 50
                else:
                    raise ValueError(f"Required column '{col}' not found in anime data")

        # Convert ObjectId to int if needed
        if anime_df['anime_id'].dtype == 'object':
            anime_df['anime_id'] = range(1, len(anime_df) + 1)

        print(f"✅ Loaded {len(anime_df)} anime from database")
        return anime_df[required_columns]

    def load_interaction_data(self) -> pd.DataFrame:
        """
        Load user interaction data from MongoDB.

        Returns:
            DataFrame with interaction data
        """
        print("📡 Loading interaction data from MongoDB...")

        # Adjust collection name as needed
        # This might be in a User model or separate Interaction collection
        interaction_collection = self.db['interactions']  # or 'user_library', etc.

        # Fetch interactions
        interaction_docs = list(interaction_collection.find())

        if not interaction_docs:
            print("⚠ No interaction data found - using empty DataFrame")
            return pd.DataFrame(columns=['user_id', 'anime_id', 'interaction_type', 'timestamp'])

        # Convert to DataFrame
        interactions_df = pd.DataFrame(interaction_docs)

        # Map fields
        # Example: if you have 'libraryItem' model with status field
        if 'status' in interactions_df.columns:
            # Map status to interaction_type
            status_mapping = {
                'completed': 'favorite',
                'watching': 'like',
                'plan_to_watch': 'view'
            }
            interactions_df['interaction_type'] = interactions_df['status'].map(
                lambda x: status_mapping.get(x, 'view')
            )

        # Ensure required columns
        required_columns = ['user_id', 'anime_id', 'interaction_type', 'timestamp']

        for col in required_columns:
            if col not in interactions_df.columns:
                if col == 'timestamp':
                    interactions_df['timestamp'] = datetime.now()
                else:
                    raise ValueError(f"Required column '{col}' not found in interaction data")

        print(f"✅ Loaded {len(interactions_df)} interactions")
        return interactions_df[required_columns]

    def initialize(self):
        """Initialize the recommendation system."""
        print("🔄 Initializing recommendation system...")

        # Load data
        anime_df = self.load_anime_data()
        interactions_df = self.load_interaction_data()

        # Preprocess
        preprocessor = AnimePreprocessor()
        processed_df = preprocessor.process_anime_dataframe(anime_df)

        # Train model
        self.model = AnimeRecommendationModel()
        self.model.fit(processed_df, precompute_similarity=False)

        # Initialize components
        self.profile_builder = UserProfileBuilder(self.model)
        self.recommender = HybridRecommender(self.model, self.profile_builder)

        # Store interactions for later use
        self.interactions_df = interactions_df

        self.is_initialized = True
        print("✅ Recommendation system initialized successfully")

    def get_recommendations(self, user_id: int, top_n: int = 10) -> list:
        """
        Get recommendations for a user.

        Args:
            user_id: User ID (from your User model)
            top_n: Number of recommendations

        Returns:
            List of recommendations
        """
        if not self.is_initialized:
            raise RuntimeError("System not initialized. Call initialize() first.")

        # Reload latest interactions from DB (optional, for real-time updates)
        latest_interactions = self.load_interaction_data()

        return self.recommender.recommend_for_user(
            user_id,
            latest_interactions,
            top_n=top_n
        )

    def get_similar_anime(self, anime_id: int, top_n: int = 10) -> list:
        """
        Get anime similar to a specific anime.

        Args:
            anime_id: Anime ID
            top_n: Number of similar anime

        Returns:
            List of similar anime
        """
        if not self.is_initialized:
            raise RuntimeError("System not initialized. Call initialize() first.")

        return self.recommender.get_similar_to_anime(anime_id, top_n=top_n)


# Example usage
if __name__ == "__main__":
    # Get MongoDB URI from environment or use default
    MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/animatch')

    try:
        # Initialize service
        service = AnimeRecommendationService(MONGODB_URI)
        service.initialize()

        # Example: Get recommendations for user 101
        print("\n🎯 Getting recommendations for user 101...")
        recommendations = service.get_recommendations(user_id=101, top_n=5)

        print("\nRecommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec['title']} - Score: {rec['hybrid_score']:.3f}")
            print(f"   {rec['reason_for_recommendation']}")

        # Example: Get similar anime
        print("\n\n🔍 Getting anime similar to anime_id=1...")
        similar = service.get_similar_anime(anime_id=1, top_n=5)

        print("\nSimilar Anime:")
        for i, rec in enumerate(similar, 1):
            print(f"{i}. {rec['title']} - Similarity: {rec['content_similarity']:.3f}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
