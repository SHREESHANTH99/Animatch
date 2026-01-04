"""
api.py
API Endpoints for Anime Recommendation System

Provides REST API endpoints for getting recommendations.
Compatible with Express.js backend via Python subprocess or separate service.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import sys
from typing import Optional

# Import recommendation system modules
from preprocess import AnimePreprocessor
from model import AnimeRecommendationModel
from user_profile import UserProfileBuilder
from recommender import HybridRecommender

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Global variables for recommendation system
recommender_system = None
interactions_df = None


class RecommenderAPI:
    """
    Wrapper class for the recommendation API.
    """

    def __init__(self):
        """Initialize the recommendation system."""
        self.model = None
        self.profile_builder = None
        self.recommender = None
        self.preprocessor = None
        self.is_initialized = False

    def initialize(self, anime_df: pd.DataFrame, interactions_df: pd.DataFrame):
        """
        Initialize the recommendation system with data.

        Args:
            anime_df: DataFrame with anime data
            interactions_df: DataFrame with user interaction data
        """
        print("🔄 Initializing recommendation system...")

        # Preprocess anime data
        self.preprocessor = AnimePreprocessor()
        processed_df = self.preprocessor.process_anime_dataframe(anime_df)

        # Train TF-IDF model
        self.model = AnimeRecommendationModel()
        self.model.fit(processed_df, precompute_similarity=False)  # Don't precompute for large datasets

        # Initialize user profile builder
        self.profile_builder = UserProfileBuilder(self.model)

        # Initialize recommender
        self.recommender = HybridRecommender(self.model, self.profile_builder)

        self.is_initialized = True
        print("✅ Recommendation system initialized successfully")

    def recommend_anime(
        self,
        user_id: int,
        interactions_df: pd.DataFrame,
        top_n: int = 10
    ) -> list:
        """
        Main recommendation function.

        Args:
            user_id: Target user ID
            interactions_df: User interaction data
            top_n: Number of recommendations

        Returns:
            List of recommended anime with reasons
        """
        if not self.is_initialized:
            raise RuntimeError("Recommendation system not initialized")

        return self.recommender.recommend_for_user(
            user_id,
            interactions_df,
            top_n=top_n
        )

    def get_similar_anime(
        self,
        anime_id: int,
        top_n: int = 10,
        exclude_ids: Optional[list] = None
    ) -> list:
        """
        Get anime similar to a specific anime.

        Args:
            anime_id: Target anime ID
            top_n: Number of similar anime
            exclude_ids: Anime IDs to exclude

        Returns:
            List of similar anime
        """
        if not self.is_initialized:
            raise RuntimeError("Recommendation system not initialized")

        return self.recommender.get_similar_to_anime(
            anime_id,
            top_n=top_n,
            exclude_ids=exclude_ids or []
        )


# Initialize global API instance
api = RecommenderAPI()


@app.route('/api/recommend/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'initialized': api.is_initialized
    })


@app.route('/api/recommend/user/<user_id>', methods=['GET'])
def get_user_recommendations_fallback(user_id: str):
    """
    Handle user recommendations with string user_id (for undefined/null cases).
    """
    # If user_id is invalid, return error
    if user_id in ['undefined', 'null', 'None', '']:
        return jsonify({
            'error': 'Invalid user ID. Please log in.',
            'recommendations': []
        }), 400
    
    # Try to convert to int and call the main endpoint
    try:
        user_id_int = int(user_id)
        return get_user_recommendations_int(user_id_int)
    except ValueError:
        return jsonify({
            'error': 'User ID must be a number',
            'recommendations': []
        }), 400


@app.route('/api/recommend/user/<int:user_id>', methods=['GET'])
def get_user_recommendations_int(user_id: int):
    """
    Get personalized recommendations for a user.

    Query parameters:
    - top_n: Number of recommendations (default: 10)

    Returns:
        JSON with recommendations
    """
    try:
        if not api.is_initialized:
            return jsonify({
                'error': 'Recommendation system not initialized'
            }), 503

        top_n = request.args.get('top_n', default=10, type=int)
        top_n = min(top_n, 50)  # Cap at 50

        # Get recommendations
        recommendations = api.recommend_anime(
            user_id,
            interactions_df,
            top_n=top_n
        )

        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'count': len(recommendations)
        })

    except Exception as e:
        print(f"❌ Error generating recommendations: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/recommend/similar/<int:anime_id>', methods=['GET'])
def get_similar_anime(anime_id: int):
    """
    Get anime similar to a specific anime.

    Query parameters:
    - top_n: Number of similar anime (default: 10)
    - exclude: Comma-separated list of anime IDs to exclude

    Returns:
        JSON with similar anime
    """
    try:
        if not api.is_initialized:
            return jsonify({
                'error': 'Recommendation system not initialized'
            }), 503

        top_n = request.args.get('top_n', default=10, type=int)
        top_n = min(top_n, 50)

        exclude_str = request.args.get('exclude', default='', type=str)
        exclude_ids = []
        if exclude_str:
            try:
                exclude_ids = [int(x.strip()) for x in exclude_str.split(',') if x.strip()]
            except:
                pass

        # Get similar anime
        similar_anime = api.get_similar_anime(
            anime_id,
            top_n=top_n,
            exclude_ids=exclude_ids
        )

        return jsonify({
            'anime_id': anime_id,
            'similar_anime': similar_anime,
            'count': len(similar_anime)
        })

    except Exception as e:
        print(f"❌ Error getting similar anime: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/recommend/initialize', methods=['POST'])
def initialize_system():
    """
    Initialize or reinitialize the recommendation system.

    Expects JSON with:
    - anime_data: List of anime objects
    - interaction_data: List of interaction objects

    Returns:
        Status message
    """
    try:
        data = request.get_json()

        if not data or 'anime_data' not in data:
            return jsonify({
                'error': 'Missing anime_data in request'
            }), 400

        # Convert to DataFrames
        anime_df = pd.DataFrame(data['anime_data'])
        interaction_df = pd.DataFrame(data.get('interaction_data', []))

        # Initialize system
        global interactions_df
        interactions_df = interaction_df

        api.initialize(anime_df, interaction_df)

        return jsonify({
            'message': 'Recommendation system initialized',
            'anime_count': len(anime_df),
            'interaction_count': len(interaction_df)
        })

    except Exception as e:
        print(f"❌ Error initializing system: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/recommend/reload', methods=['POST'])
def reload_model():
    """
    Reload the model from saved file.

    Expects JSON with:
    - model_path: Path to saved model file

    Returns:
        Status message
    """
    try:
        data = request.get_json()
        model_path = data.get('model_path', 'anime_model.pkl')

        if not os.path.exists(model_path):
            return jsonify({
                'error': f'Model file not found: {model_path}'
            }), 404

        # Load model
        api.model = AnimeRecommendationModel()
        api.model.load_model(model_path)

        # Reinitialize dependent components
        api.profile_builder = UserProfileBuilder(api.model)
        api.recommender = HybridRecommender(api.model, api.profile_builder)
        api.is_initialized = True

        return jsonify({
            'message': 'Model reloaded successfully'
        })

    except Exception as e:
        print(f"❌ Error reloading model: {e}")
        return jsonify({
            'error': str(e)
        }), 500


# Standalone function for use without Flask
def recommend_anime(user_id: int, top_n: int = 10) -> list:
    """
    Standalone recommendation function.
    Can be called directly from Node.js backend using subprocess.

    Args:
        user_id: Target user ID
        top_n: Number of recommendations

    Returns:
        List of recommendations as dictionaries
    """
    global api, interactions_df

    if not api.is_initialized:
        raise RuntimeError("Recommendation system not initialized. Call initialize() first.")

    return api.recommend_anime(user_id, interactions_df, top_n)


# Command-line interface for testing
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Anime Recommendation API')
    parser.add_argument('--mode', choices=['server', 'test', 'recommend'], default='server',
                        help='Run mode: server (Flask API), test (run tests), or recommend (CLI)')
    parser.add_argument('--user-id', type=int, help='User ID for recommendation')
    parser.add_argument('--top-n', type=int, default=10, help='Number of recommendations')
    parser.add_argument('--port', type=int, default=5001, help='Port for Flask server')
    parser.add_argument('--anime-file', type=str, help='Path to anime CSV file')
    parser.add_argument('--interaction-file', type=str, help='Path to interaction CSV file')

    args = parser.parse_args()

    if args.mode == 'server':
        # Start Flask server
        print(f"🚀 Starting recommendation API server on port {args.port}...")
        app.run(host='0.0.0.0', port=args.port, debug=False)

    elif args.mode == 'test':
        # Run tests with sample data
        print("🧪 Running tests with sample data...")

        sample_anime = {
            'anime_id': [1, 2, 3, 4, 5],
            'title': ['Naruto', 'Attack on Titan', 'Death Note', 'One Piece', 'Bleach'],
            'genres': [
                'Action, Adventure, Shounen',
                'Action, Drama, Fantasy',
                'Mystery, Psychological, Thriller',
                'Action, Adventure, Shounen',
                'Action, Adventure, Shounen'
            ],
            'themes': [
                'Ninja, Friendship',
                'Survival, Military',
                'Detective, Mind Games',
                'Pirates, Friendship',
                'Samurai, Shinigami'
            ],
            'synopsis': [
                'A young ninja seeks recognition',
                'Humanity fights against giant titans',
                'A student finds a notebook that kills',
                'A pirate seeks to become the pirate king',
                'A teenager becomes a soul reaper'
            ],
            'popularity_score': [95, 98, 97, 99, 90]
        }

        sample_interactions = {
            'user_id': [101, 101, 101],
            'anime_id': [1, 4, 5],
            'interaction_type': ['favorite', 'like', 'view'],
            'timestamp': pd.date_range('2024-01-01', periods=3)
        }

        anime_df = pd.DataFrame(sample_anime)
        interactions_df = pd.DataFrame(sample_interactions)

        api.initialize(anime_df, interactions_df)

        recommendations = recommend_anime(101, top_n=3)

        print("\n✅ Test Results:")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['title']}")
            print(f"   Score: {rec['hybrid_score']:.3f}")
            print(f"   Reason: {rec['reason_for_recommendation']}")

    elif args.mode == 'recommend':
        # CLI recommendation mode
        if not args.user_id:
            print("❌ Error: --user-id required for recommend mode")
            sys.exit(1)

        if not args.anime_file or not args.interaction_file:
            print("❌ Error: --anime-file and --interaction-file required")
            sys.exit(1)

        # Load data
        anime_df = pd.read_csv(args.anime_file)
        interactions_df = pd.read_csv(args.interaction_file)

        # Initialize and get recommendations
        api.initialize(anime_df, interactions_df)
        recommendations = recommend_anime(args.user_id, args.top_n)

        # Print results as JSON
        import json
        print(json.dumps(recommendations, indent=2))

# Auto-initialize when running with Gunicorn
if os.environ.get('MONGODB_URI') and not api.is_initialized:
    try:
        print("🚀 Auto-initializing recommendation system...")
        from load_from_mongodb import load_anime_from_mongodb
        from dotenv import load_dotenv
        
        # Load environment variables
        load_dotenv()
        
        mongodb_uri = os.environ.get('MONGODB_URI')
        if mongodb_uri:
            print("📡 Loading data from MongoDB...")
            anime_df, interaction_df = load_anime_from_mongodb(mongodb_uri)
            print(f"✅ Loaded {len(anime_df)} anime and {len(interaction_df)} interactions")
            
            # Set global interactions_df
            interactions_df = interaction_df
            
            # Initialize the system
            api.initialize(anime_df, interaction_df)
            print("✅ Recommendation system ready!")
        else:
            print("⚠️  MONGODB_URI not set, skipping auto-initialization")
    except Exception as e:
        print(f"❌ Auto-initialization failed: {e}")
        import traceback
        traceback.print_exc()
