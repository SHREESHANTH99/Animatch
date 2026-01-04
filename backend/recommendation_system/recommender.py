"""
recommender.py
Main Recommendation Engine with Hybrid Scoring

Combines content-based similarity with popularity scoring
to generate personalized recommendations.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from sklearn.metrics.pairwise import cosine_similarity


class HybridRecommender:
    """
    Hybrid recommendation engine combining:
    - Content-based filtering (TF-IDF + Cosine Similarity)
    - Popularity-based scoring
    - User personalization

    Final Score = 0.6 * content_similarity + 0.4 * normalized_popularity
    """

    def __init__(self, model, profile_builder, content_weight: float = 0.6):
        """
        Initialize the hybrid recommender.

        Args:
            model: AnimeRecommendationModel instance
            profile_builder: UserProfileBuilder instance
            content_weight: Weight for content similarity (0 to 1)
        """
        self.model = model
        self.profile_builder = profile_builder
        self.content_weight = content_weight
        self.popularity_weight = 1.0 - content_weight

        # Normalize popularity scores once
        self._normalize_popularity_scores()

    def _normalize_popularity_scores(self):
        """
        Normalize popularity scores to 0-1 range for fair comparison.
        Uses min-max normalization.
        """
        df = self.model.anime_data

        if 'popularity_score' in df.columns:
            min_pop = df['popularity_score'].min()
            max_pop = df['popularity_score'].max()

            if max_pop > min_pop:
                df['normalized_popularity'] = (
                    (df['popularity_score'] - min_pop) / (max_pop - min_pop)
                )
            else:
                df['normalized_popularity'] = 0.5

            self.model.anime_data = df
        else:
            # If no popularity scores, set all to 0.5
            df['normalized_popularity'] = 0.5
            self.model.anime_data = df

    def compute_hybrid_score(
        self,
        anime_id: int,
        content_similarity: float
    ) -> float:
        """
        Compute hybrid score combining content similarity and popularity.

        Formula: 0.6 * content_similarity + 0.4 * normalized_popularity

        Args:
            anime_id: Target anime ID
            content_similarity: Content-based similarity score

        Returns:
            Hybrid score (0 to 1)
        """
        # Get normalized popularity
        anime_data = self.model.anime_data[
            self.model.anime_data['anime_id'] == anime_id
        ]

        if len(anime_data) > 0:
            popularity = anime_data.iloc[0]['normalized_popularity']
        else:
            popularity = 0.5  # Default mid-range popularity

        # Compute hybrid score
        hybrid_score = (
            self.content_weight * content_similarity +
            self.popularity_weight * popularity
        )

        return float(hybrid_score)

    def recommend_for_user(
        self,
        user_id: int,
        interactions_df: pd.DataFrame,
        top_n: int = 10,
        diversity_factor: float = 0.0
    ) -> List[Dict]:
        """
        Generate personalized recommendations for a user.

        Args:
            user_id: Target user ID
            interactions_df: DataFrame of user interactions
            top_n: Number of recommendations to return
            diversity_factor: 0-1, higher values increase genre diversity

        Returns:
            List of recommendation dictionaries with:
            - anime_id
            - title
            - genres
            - similarity_score
            - popularity_score
            - hybrid_score
            - reason_for_recommendation
        """
        # Get user interactions
        user_interactions = self.profile_builder.get_user_interactions(
            interactions_df, user_id
        )

        # Check if cold-start user
        if self.profile_builder.is_cold_start_user(user_interactions):
            return self._recommend_for_cold_start(top_n)

        # Build user profile vector
        user_vector, interacted_anime_ids = self.profile_builder.build_user_vector(
            user_interactions
        )

        # Compute similarity scores for all anime
        similarity_scores = cosine_similarity(
            user_vector, self.model.tfidf_matrix
        )[0]

        # Get all anime and their scores
        candidates = []
        for idx, anime_id in self.model.index_to_anime.items():
            # Skip anime the user already interacted with
            if anime_id in interacted_anime_ids:
                continue

            content_sim = float(similarity_scores[idx])

            # Skip anime with very low similarity
            if content_sim < 0.01:
                continue

            # Compute hybrid score
            hybrid_score = self.compute_hybrid_score(anime_id, content_sim)

            candidates.append({
                'anime_id': anime_id,
                'content_similarity': content_sim,
                'hybrid_score': hybrid_score
            })

        # Sort by hybrid score
        candidates = sorted(candidates, key=lambda x: x['hybrid_score'], reverse=True)

        # Apply diversity if requested
        if diversity_factor > 0:
            candidates = self._apply_diversity(candidates, diversity_factor, top_n * 3)

        # Take top N
        top_candidates = candidates[:top_n]

        # Enrich with anime details and explanations
        recommendations = []
        for candidate in top_candidates:
            anime_id = candidate['anime_id']

            # Get anime details
            anime_data = self.model.anime_data[
                self.model.anime_data['anime_id'] == anime_id
            ]

            if len(anime_data) > 0:
                anime = anime_data.iloc[0]

                # Generate explanation
                explanation = self.profile_builder.explain_recommendation(
                    anime_id,
                    user_interactions,
                    candidate['content_similarity']
                )

                # Get image URL, fix if it's just a filename
                image_url = anime.get('image_url', '')
                if image_url and not image_url.startswith('http'):
                    # If it's just a filename like "87473.jpg", construct a placeholder
                    image_url = f"https://via.placeholder.com/225x318/6366f1/ffffff?text={anime['title'][:20]}"

                recommendations.append({
                    'anime_id': int(anime_id),
                    'title': anime['title'],
                    'genres': anime.get('genres', ''),
                    'themes': anime.get('themes', ''),
                    'image_url': image_url,
                    'popularity_score': float(anime.get('popularity_score', 0)),
                    'content_similarity': round(candidate['content_similarity'], 3),
                    'hybrid_score': round(candidate['hybrid_score'], 3),
                    'reason_for_recommendation': explanation
                })

        return recommendations

    def _recommend_for_cold_start(self, top_n: int = 10) -> List[Dict]:
        """
        Generate recommendations for cold-start users (new users).

        Strategy:
        - Return diverse popular anime
        - Ensure genre variety

        Args:
            top_n: Number of recommendations

        Returns:
            List of recommendation dictionaries
        """
        # Get diverse popular anime
        diverse_anime_ids = self.profile_builder.get_diverse_recommendations(
            n=top_n,
            genre_diversity=True
        )

        recommendations = []
        for anime_id in diverse_anime_ids:
            anime_data = self.model.anime_data[
                self.model.anime_data['anime_id'] == anime_id
            ]

            if len(anime_data) > 0:
                anime = anime_data.iloc[0]

                # Get image URL, fix if it's just a filename
                image_url = anime.get('image_url', '')
                if image_url and not image_url.startswith('http'):
                    # If it's just a filename like "87473.jpg", construct a placeholder
                    image_url = f"https://via.placeholder.com/225x318/6366f1/ffffff?text={anime['title'][:20]}"

                recommendations.append({
                    'anime_id': int(anime_id),
                    'title': anime['title'],
                    'genres': anime.get('genres', ''),
                    'themes': anime.get('themes', ''),
                    'image_url': image_url,
                    'popularity_score': float(anime.get('popularity_score', 0)),
                    'content_similarity': 0.0,  # Not applicable for cold-start
                    'hybrid_score': float(anime['normalized_popularity']),
                    'reason_for_recommendation': 'Popular and highly rated anime for new viewers'
                })

        return recommendations

    def _apply_diversity(
        self,
        candidates: List[Dict],
        diversity_factor: float,
        max_candidates: int
    ) -> List[Dict]:
        """
        Apply genre diversity to candidate list.

        Args:
            candidates: List of candidate recommendations
            diversity_factor: 0-1, strength of diversity penalty
            max_candidates: Maximum candidates to consider

        Returns:
            Reranked list with diversity applied
        """
        if diversity_factor <= 0 or len(candidates) == 0:
            return candidates

        # Take top candidates for diversity computation
        top_candidates = candidates[:max_candidates]

        selected = []
        selected_genres = set()

        for candidate in top_candidates:
            anime_id = candidate['anime_id']

            # Get anime genres
            anime_data = self.model.anime_data[
                self.model.anime_data['anime_id'] == anime_id
            ]

            if len(anime_data) > 0:
                genres_str = anime_data.iloc[0].get('genres', '')
                if isinstance(genres_str, str):
                    genres = set(g.strip().lower() for g in genres_str.split(',') if g.strip())

                    # Calculate diversity bonus
                    new_genres = genres - selected_genres
                    diversity_bonus = len(new_genres) / max(len(genres), 1)

                    # Adjust score with diversity
                    adjusted_score = (
                        candidate['hybrid_score'] * (1 - diversity_factor) +
                        diversity_bonus * diversity_factor
                    )

                    candidate['adjusted_score'] = adjusted_score
                    selected.append(candidate)

                    # Update selected genres
                    selected_genres.update(genres)
                else:
                    candidate['adjusted_score'] = candidate['hybrid_score']
                    selected.append(candidate)
            else:
                candidate['adjusted_score'] = candidate['hybrid_score']
                selected.append(candidate)

        # Re-sort by adjusted score
        selected = sorted(selected, key=lambda x: x['adjusted_score'], reverse=True)

        return selected

    def get_similar_to_anime(
        self,
        anime_id: int,
        top_n: int = 10,
        exclude_ids: List[int] = None
    ) -> List[Dict]:
        """
        Get anime similar to a specific anime.
        Useful for "More like this" features.

        Args:
            anime_id: Target anime ID
            top_n: Number of similar anime to return
            exclude_ids: Anime IDs to exclude

        Returns:
            List of similar anime with scores and reasons
        """
        # Get similar anime using content similarity
        similar_pairs = self.model.get_similar_anime(
            anime_id, top_n * 2, exclude_ids
        )

        recommendations = []
        for similar_anime_id, content_sim in similar_pairs:
            # Compute hybrid score
            hybrid_score = self.compute_hybrid_score(similar_anime_id, content_sim)

            # Get anime details
            anime_data = self.model.anime_data[
                self.model.anime_data['anime_id'] == similar_anime_id
            ]

            if len(anime_data) > 0:
                anime = anime_data.iloc[0]

                # Get common features for explanation
                target_features = self.model.get_top_features_for_anime(anime_id, 5)
                similar_features = self.model.get_top_features_for_anime(similar_anime_id, 5)
                common_features = set(target_features) & set(similar_features)

                if common_features:
                    reason = f"Shares similar themes: {', '.join(list(common_features)[:2])}"
                else:
                    reason = "Similar content and style"

                # Get image URL, fix if it's just a filename
                image_url = anime.get('image_url', '')
                if image_url and not image_url.startswith('http'):
                    # If it's just a filename like "87473.jpg", construct a placeholder
                    image_url = f"https://via.placeholder.com/225x318/6366f1/ffffff?text={anime['title'][:20]}"

                recommendations.append({
                    'anime_id': int(similar_anime_id),
                    'title': anime['title'],
                    'genres': anime.get('genres', ''),
                    'themes': anime.get('themes', ''),
                    'image_url': image_url,
                    'popularity_score': float(anime.get('popularity_score', 0)),
                    'content_similarity': round(content_sim, 3),
                    'hybrid_score': round(hybrid_score, 3),
                    'reason_for_recommendation': reason
                })

        # Sort by hybrid score and take top N
        recommendations = sorted(recommendations, key=lambda x: x['hybrid_score'], reverse=True)
        return recommendations[:top_n]


# Example usage and testing
if __name__ == "__main__":
    from preprocess import AnimePreprocessor
    from model import AnimeRecommendationModel
    from user_profile import UserProfileBuilder

    # Sample data
    anime_data = {
        'anime_id': [1, 2, 3, 4, 5, 6],
        'title': ['Naruto', 'Attack on Titan', 'Death Note', 'One Piece', 'Bleach', 'Demon Slayer'],
        'genres': [
            'Action, Adventure, Shounen',
            'Action, Drama, Fantasy',
            'Mystery, Psychological, Thriller',
            'Action, Adventure, Shounen',
            'Action, Adventure, Shounen',
            'Action, Fantasy, Shounen'
        ],
        'themes': [
            'Ninja, Friendship',
            'Survival, Military',
            'Detective, Mind Games',
            'Pirates, Friendship',
            'Samurai, Shinigami',
            'Demons, Family'
        ],
        'synopsis': [
            'A young ninja seeks recognition',
            'Humanity fights against giant titans',
            'A student finds a notebook that kills',
            'A pirate seeks to become the pirate king',
            'A teenager becomes a soul reaper',
            'A boy becomes a demon slayer'
        ],
        'popularity_score': [95, 98, 97, 99, 90, 96]
    }

    interactions_data = {
        'user_id': [101, 101, 101, 102],
        'anime_id': [1, 4, 5, 2],
        'interaction_type': ['favorite', 'like', 'view', 'favorite'],
        'timestamp': pd.date_range('2024-01-01', periods=4)
    }

    anime_df = pd.DataFrame(anime_data)
    interactions_df = pd.DataFrame(interactions_data)

    # Initialize system
    preprocessor = AnimePreprocessor()
    processed_df = preprocessor.process_anime_dataframe(anime_df)

    model = AnimeRecommendationModel()
    model.fit(processed_df)

    profile_builder = UserProfileBuilder(model)
    recommender = HybridRecommender(model, profile_builder)

    # Test recommendations
    print("🎯 Recommendations for User 101:")
    recommendations = recommender.recommend_for_user(101, interactions_df, top_n=3)

    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Genres: {rec['genres']}")
        print(f"   Hybrid Score: {rec['hybrid_score']:.3f}")
        print(f"   Reason: {rec['reason_for_recommendation']}")

    print("\n\n🔍 Similar to 'Naruto':")
    similar = recommender.get_similar_to_anime(1, top_n=3)

    for i, rec in enumerate(similar, 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Similarity: {rec['content_similarity']:.3f}")
        print(f"   Reason: {rec['reason_for_recommendation']}")
