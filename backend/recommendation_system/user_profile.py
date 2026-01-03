"""
user_profile.py
User Profile Construction from Interaction History

Builds user preference vectors by aggregating TF-IDF vectors
of anime the user has liked or favorited.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Set, Tuple
from scipy.sparse import csr_matrix, vstack
from collections import defaultdict


class UserProfileBuilder:
    """
    Builds user preference profiles from interaction history.
    """

    def __init__(self, model):
        """
        Initialize with a trained recommendation model.

        Args:
            model: AnimeRecommendationModel instance
        """
        self.model = model

        # Interaction weights for computing user profile
        self.interaction_weights = {
            'favorite': 3.0,  # Highest weight
            'like': 2.0,      # Medium weight
            'view': 1.0       # Lowest weight (just viewed)
        }

    def get_user_interactions(
        self,
        interactions_df: pd.DataFrame,
        user_id: int
    ) -> pd.DataFrame:
        """
        Get all interactions for a specific user.

        Args:
            interactions_df: DataFrame with columns: user_id, anime_id, interaction_type, timestamp
            user_id: Target user ID

        Returns:
            DataFrame of user's interactions
        """
        return interactions_df[interactions_df['user_id'] == user_id]

    def build_user_vector(
        self,
        user_interactions: pd.DataFrame
    ) -> Tuple[csr_matrix, List[int]]:
        """
        Build a user preference vector from their interaction history.

        Strategy:
        1. Get TF-IDF vectors for each anime the user interacted with
        2. Weight each vector by interaction type
        3. Average the weighted vectors to create user profile

        Args:
            user_interactions: DataFrame of user's interactions

        Returns:
            Tuple of (user_vector, list of interacted anime IDs)
        """
        if len(user_interactions) == 0:
            # Return zero vector for cold-start users
            n_features = self.model.tfidf_matrix.shape[1]
            zero_vector = np.zeros((1, n_features))
            return zero_vector, []

        weighted_vectors = []
        weights = []
        interacted_anime_ids = []

        for _, interaction in user_interactions.iterrows():
            anime_id = interaction['anime_id']
            interaction_type = interaction.get('interaction_type', 'view')

            # Get anime vector
            anime_vector = self.model.get_anime_vector(anime_id)

            if anime_vector is not None:
                # Get weight for this interaction type
                weight = self.interaction_weights.get(interaction_type, 1.0)

                weighted_vectors.append(anime_vector * weight)
                weights.append(weight)
                interacted_anime_ids.append(anime_id)

        if not weighted_vectors:
            # No valid interactions found
            n_features = self.model.tfidf_matrix.shape[1]
            zero_vector = np.zeros((1, n_features))
            return zero_vector, []

        # Stack all weighted vectors
        stacked_vectors = vstack(weighted_vectors)

        # Compute weighted average
        total_weight = sum(weights)
        user_vector = stacked_vectors.sum(axis=0) / total_weight

        # Convert to array to avoid np.matrix deprecation warning
        # This ensures compatibility with newer scikit-learn versions
        if hasattr(user_vector, 'A'):
            user_vector = np.asarray(user_vector.A).reshape(1, -1)
        else:
            user_vector = np.asarray(user_vector)
            if user_vector.ndim == 1:
                user_vector = user_vector.reshape(1, -1)

        return user_vector, interacted_anime_ids

    def get_user_preferred_genres(
        self,
        user_interactions: pd.DataFrame
    ) -> Dict[str, float]:
        """
        Analyze user's genre preferences from interaction history.

        Args:
            user_interactions: DataFrame of user's interactions

        Returns:
            Dictionary mapping genre to preference score
        """
        genre_scores = defaultdict(float)
        total_weight = 0

        for _, interaction in user_interactions.iterrows():
            anime_id = interaction['anime_id']
            interaction_type = interaction.get('interaction_type', 'view')
            weight = self.interaction_weights.get(interaction_type, 1.0)

            # Get anime data
            anime_data = self.model.anime_data[
                self.model.anime_data['anime_id'] == anime_id
            ]

            if len(anime_data) > 0:
                genres_str = anime_data.iloc[0].get('genres', '')
                if isinstance(genres_str, str):
                    genres = [g.strip().lower() for g in genres_str.split(',') if g.strip()]

                    for genre in genres:
                        genre_scores[genre] += weight

                total_weight += weight

        # Normalize scores
        if total_weight > 0:
            for genre in genre_scores:
                genre_scores[genre] /= total_weight

        return dict(genre_scores)

    def is_cold_start_user(
        self,
        user_interactions: pd.DataFrame,
        threshold: int = 3
    ) -> bool:
        """
        Determine if a user is a cold-start user.

        Args:
            user_interactions: DataFrame of user's interactions
            threshold: Minimum number of interactions to not be cold-start

        Returns:
            True if user has fewer than threshold interactions
        """
        return len(user_interactions) < threshold

    def get_diverse_recommendations(
        self,
        n: int = 10,
        genre_diversity: bool = True
    ) -> List[int]:
        """
        Get diverse popular anime for cold-start users.

        Strategy:
        - Select top popular anime
        - Ensure genre diversity if requested

        Args:
            n: Number of recommendations
            genre_diversity: Whether to ensure genre diversity

        Returns:
            List of anime IDs
        """
        df = self.model.anime_data.copy()

        # Sort by popularity
        df = df.sort_values('popularity_score', ascending=False)

        if not genre_diversity:
            return df['anime_id'].head(n).tolist()

        # Ensure genre diversity
        recommendations = []
        used_genres = set()

        for _, anime in df.iterrows():
            if len(recommendations) >= n:
                break

            genres_str = anime.get('genres', '')
            if isinstance(genres_str, str):
                genres = [g.strip().lower() for g in genres_str.split(',') if g.strip()]

                # Check if this anime introduces new genres
                new_genres = set(genres) - used_genres

                if new_genres or len(recommendations) < 3:
                    # Accept if it has new genres or if we're still building initial recommendations
                    recommendations.append(anime['anime_id'])
                    used_genres.update(genres)

        # Fill remaining slots if needed
        if len(recommendations) < n:
            remaining = df[~df['anime_id'].isin(recommendations)]['anime_id'].head(n - len(recommendations))
            recommendations.extend(remaining.tolist())

        return recommendations

    def explain_recommendation(
        self,
        recommended_anime_id: int,
        user_interactions: pd.DataFrame,
        similarity_score: float
    ) -> str:
        """
        Generate human-readable explanation for a recommendation.

        Args:
            recommended_anime_id: ID of recommended anime
            user_interactions: User's interaction history
            similarity_score: Content similarity score

        Returns:
            Explanation string
        """
        # Get user's preferred genres
        user_genres = self.get_user_preferred_genres(user_interactions)
        top_user_genres = sorted(user_genres.items(), key=lambda x: x[1], reverse=True)[:3]
        top_user_genre_names = [g[0].title() for g in top_user_genres]

        # Get recommended anime genres
        anime_data = self.model.anime_data[
            self.model.anime_data['anime_id'] == recommended_anime_id
        ]

        if len(anime_data) > 0:
            genres_str = anime_data.iloc[0].get('genres', '')
            if isinstance(genres_str, str):
                recommended_genres = [g.strip().title() for g in genres_str.split(',') if g.strip()]

                # Find matching genres
                matching_genres = set(g.lower() for g in recommended_genres) & set(user_genres.keys())

                if matching_genres:
                    matching_genre_names = [g.title() for g in matching_genres]
                    return f"Similar to anime you liked in {', '.join(matching_genre_names[:2])} genres"
                elif top_user_genre_names and recommended_genres:
                    return f"Matches your interest in {', '.join(top_user_genre_names[:2])} anime"

        # Fallback explanations
        if similarity_score > 0.7:
            return "Highly similar to anime you enjoyed"
        elif similarity_score > 0.5:
            return "Similar themes and style to your favorites"
        else:
            return "Popular among users with similar taste"

    def get_user_statistics(
        self,
        user_interactions: pd.DataFrame
    ) -> Dict:
        """
        Get statistics about user's viewing behavior.

        Args:
            user_interactions: User's interaction history

        Returns:
            Dictionary of statistics
        """
        stats = {
            'total_interactions': len(user_interactions),
            'favorites': len(user_interactions[user_interactions['interaction_type'] == 'favorite']),
            'likes': len(user_interactions[user_interactions['interaction_type'] == 'like']),
            'views': len(user_interactions[user_interactions['interaction_type'] == 'view']),
            'unique_anime': user_interactions['anime_id'].nunique(),
            'preferred_genres': self.get_user_preferred_genres(user_interactions)
        }

        return stats


# Example usage and testing
if __name__ == "__main__":
    from preprocess import AnimePreprocessor
    from model import AnimeRecommendationModel

    # Sample anime data
    anime_data = {
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

    # Sample interaction data
    interactions_data = {
        'user_id': [101, 101, 101, 102, 102],
        'anime_id': [1, 4, 5, 2, 3],
        'interaction_type': ['favorite', 'like', 'view', 'favorite', 'like'],
        'timestamp': pd.date_range('2024-01-01', periods=5)
    }

    anime_df = pd.DataFrame(anime_data)
    interactions_df = pd.DataFrame(interactions_data)

    # Preprocess and train model
    preprocessor = AnimePreprocessor()
    processed_df = preprocessor.process_anime_dataframe(anime_df)

    model = AnimeRecommendationModel()
    model.fit(processed_df)

    # Build user profile
    profile_builder = UserProfileBuilder(model)

    print("👤 User 101 Profile:")
    user101_interactions = profile_builder.get_user_interactions(interactions_df, 101)
    user_vector, interacted_ids = profile_builder.build_user_vector(user101_interactions)
    print(f"  - Interacted with: {interacted_ids}")

    print("\n📊 User 101 Statistics:")
    stats = profile_builder.get_user_statistics(user101_interactions)
    for key, value in stats.items():
        if key != 'preferred_genres':
            print(f"  - {key}: {value}")

    print("\n🎭 User 101 Preferred Genres:")
    for genre, score in stats['preferred_genres'].items():
        print(f"  - {genre}: {score:.2f}")

    print("\n🆕 Cold-start check:")
    print(f"  User 101 is cold-start: {profile_builder.is_cold_start_user(user101_interactions)}")
