"""
utils.py
Utility Functions for Recommendation System
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional
import logging
import json
from datetime import datetime


def setup_logging(log_file: str = 'recommendation_system.log', level: str = 'INFO'):
    """
    Set up logging configuration.

    Args:
        log_file: Path to log file
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    logging.basicConfig(
        level=getattr(logging, level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )


def load_anime_data_from_db(connection_string: str) -> pd.DataFrame:
    """
    Load anime data from database.
    This is a placeholder - implement based on your database.

    Args:
        connection_string: Database connection string

    Returns:
        DataFrame with anime data
    """
    # TODO: Implement database loading
    # Example for MongoDB:
    # from pymongo import MongoClient
    # client = MongoClient(connection_string)
    # db = client['animatch']
    # anime_collection = db['anime']
    # anime_data = list(anime_collection.find())
    # return pd.DataFrame(anime_data)

    raise NotImplementedError("Database loading not implemented")


def load_interaction_data_from_db(connection_string: str) -> pd.DataFrame:
    """
    Load user interaction data from database.

    Args:
        connection_string: Database connection string

    Returns:
        DataFrame with interaction data
    """
    # TODO: Implement database loading
    raise NotImplementedError("Database loading not implemented")


def save_recommendations_to_cache(
    user_id: int,
    recommendations: List[Dict],
    cache_dir: str = './cache'
) -> None:
    """
    Save recommendations to cache for faster retrieval.

    Args:
        user_id: User ID
        recommendations: List of recommendations
        cache_dir: Directory to store cache files
    """
    import os

    os.makedirs(cache_dir, exist_ok=True)

    cache_file = os.path.join(cache_dir, f'user_{user_id}_recommendations.json')

    cache_data = {
        'user_id': user_id,
        'recommendations': recommendations,
        'timestamp': datetime.now().isoformat(),
        'count': len(recommendations)
    }

    with open(cache_file, 'w') as f:
        json.dump(cache_data, f, indent=2)


def load_recommendations_from_cache(
    user_id: int,
    cache_dir: str = './cache',
    max_age_hours: int = 24
) -> Optional[List[Dict]]:
    """
    Load recommendations from cache if available and fresh.

    Args:
        user_id: User ID
        cache_dir: Directory with cache files
        max_age_hours: Maximum age of cache in hours

    Returns:
        List of recommendations or None if cache invalid
    """
    import os
    from datetime import timedelta

    cache_file = os.path.join(cache_dir, f'user_{user_id}_recommendations.json')

    if not os.path.exists(cache_file):
        return None

    try:
        with open(cache_file, 'r') as f:
            cache_data = json.load(f)

        # Check cache age
        timestamp = datetime.fromisoformat(cache_data['timestamp'])
        age = datetime.now() - timestamp

        if age > timedelta(hours=max_age_hours):
            return None  # Cache too old

        return cache_data['recommendations']

    except Exception as e:
        logging.error(f"Error loading cache: {e}")
        return None


def calculate_recommendation_metrics(
    recommendations: List[Dict],
    ground_truth: List[int]
) -> Dict[str, float]:
    """
    Calculate evaluation metrics for recommendations.

    Args:
        recommendations: List of recommended anime
        ground_truth: List of anime IDs user actually liked

    Returns:
        Dictionary with precision, recall, and other metrics
    """
    if not recommendations or not ground_truth:
        return {
            'precision': 0.0,
            'recall': 0.0,
            'f1': 0.0,
            'hit_rate': 0.0
        }

    # Extract recommended IDs
    recommended_ids = [rec['anime_id'] for rec in recommendations]

    # Calculate hits
    hits = set(recommended_ids) & set(ground_truth)

    # Precision: fraction of recommendations that are relevant
    precision = len(hits) / len(recommended_ids) if recommended_ids else 0.0

    # Recall: fraction of relevant items that are recommended
    recall = len(hits) / len(ground_truth) if ground_truth else 0.0

    # F1 Score: harmonic mean of precision and recall
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    # Hit Rate: 1 if at least one hit, 0 otherwise
    hit_rate = 1.0 if len(hits) > 0 else 0.0

    return {
        'precision': round(precision, 3),
        'recall': round(recall, 3),
        'f1': round(f1, 3),
        'hit_rate': round(hit_rate, 3),
        'hits': len(hits)
    }


def format_recommendation_for_frontend(recommendations: List[Dict]) -> List[Dict]:
    """
    Format recommendations for frontend consumption.

    Args:
        recommendations: List of recommendation dictionaries

    Returns:
        Formatted list suitable for JSON API response
    """
    formatted = []

    for rec in recommendations:
        formatted.append({
            'animeId': rec['anime_id'],
            'title': rec['title'],
            'genres': rec.get('genres', '').split(',') if rec.get('genres') else [],
            'themes': rec.get('themes', '').split(',') if rec.get('themes') else [],
            'score': rec.get('hybrid_score', 0.0),
            'popularityScore': rec.get('popularity_score', 0.0),
            'reason': rec.get('reason_for_recommendation', ''),
            'similarity': rec.get('content_similarity', 0.0)
        })

    return formatted


def batch_recommend(
    recommender,
    user_ids: List[int],
    interactions_df: pd.DataFrame,
    top_n: int = 10
) -> Dict[int, List[Dict]]:
    """
    Generate recommendations for multiple users in batch.

    Args:
        recommender: HybridRecommender instance
        user_ids: List of user IDs
        interactions_df: Interaction data
        top_n: Number of recommendations per user

    Returns:
        Dictionary mapping user_id to recommendations
    """
    results = {}

    for user_id in user_ids:
        try:
            recommendations = recommender.recommend_for_user(
                user_id,
                interactions_df,
                top_n=top_n
            )
            results[user_id] = recommendations
        except Exception as e:
            logging.error(f"Error generating recommendations for user {user_id}: {e}")
            results[user_id] = []

    return results


def explain_recommendation_detailed(
    recommended_anime: Dict,
    user_profile: Dict
) -> str:
    """
    Generate detailed explanation for why an anime was recommended.

    Args:
        recommended_anime: Anime that was recommended
        user_profile: User's profile/preferences

    Returns:
        Detailed explanation string
    """
    explanation_parts = []

    # Score-based explanation
    score = recommended_anime.get('hybrid_score', 0.0)
    if score > 0.8:
        explanation_parts.append("Highly recommended based on your preferences")
    elif score > 0.6:
        explanation_parts.append("Good match for your taste")
    else:
        explanation_parts.append("Might interest you")

    # Genre match
    genres = recommended_anime.get('genres', '').lower()
    if user_profile.get('preferred_genres'):
        matching_genres = [g for g in user_profile['preferred_genres'] if g in genres]
        if matching_genres:
            explanation_parts.append(f"Matches your favorite genres: {', '.join(matching_genres[:2])}")

    # Popularity
    popularity = recommended_anime.get('popularity_score', 0)
    if popularity > 90:
        explanation_parts.append("Highly popular among anime fans")

    return " • ".join(explanation_parts)


def get_recommendation_diversity(recommendations: List[Dict]) -> float:
    """
    Calculate diversity score of recommendations based on genre variety.

    Args:
        recommendations: List of recommendations

    Returns:
        Diversity score (0 to 1, higher is more diverse)
    """
    if not recommendations:
        return 0.0

    all_genres = set()
    for rec in recommendations:
        genres_str = rec.get('genres', '')
        if isinstance(genres_str, str):
            genres = [g.strip().lower() for g in genres_str.split(',') if g.strip()]
            all_genres.update(genres)

    # More unique genres = higher diversity
    # Normalize by total possible genres (assume ~30 common genres)
    diversity_score = len(all_genres) / 30.0
    return min(diversity_score, 1.0)


# Example usage
if __name__ == "__main__":
    # Test utility functions
    print("🧪 Testing utility functions...")

    # Test recommendation formatting
    sample_rec = [{
        'anime_id': 1,
        'title': 'Naruto',
        'genres': 'Action, Adventure, Shounen',
        'themes': 'Ninja, Friendship',
        'hybrid_score': 0.85,
        'popularity_score': 95,
        'reason_for_recommendation': 'Similar to anime you liked'
    }]

    formatted = format_recommendation_for_frontend(sample_rec)
    print("\n📊 Formatted recommendation:")
    print(json.dumps(formatted, indent=2))

    # Test diversity calculation
    diversity = get_recommendation_diversity(sample_rec)
    print(f"\n🎨 Diversity score: {diversity:.2f}")

    print("\n✅ Utility tests completed")
