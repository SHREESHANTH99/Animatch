"""
preprocess.py
Data preprocessing for anime recommendation system

This module handles text cleaning and feature combination
for content-based filtering using TF-IDF vectorization.
"""

import re
import pandas as pd
import numpy as np
from typing import List, Dict


class AnimePreprocessor:
    """
    Preprocesses anime data for recommendation engine.
    Combines genres, themes, and synopsis into a single text feature.
    """

    def __init__(self):
        """Initialize the preprocessor with default settings."""
        self.stop_words = set([
            'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ])

    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text data.

        Args:
            text: Raw text string

        Returns:
            Cleaned lowercase text without special characters
        """
        if not isinstance(text, str) or not text:
            return ""

        # Convert to lowercase
        text = text.lower()

        # Remove special characters and extra whitespace
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)

        # Remove stop words
        words = text.split()
        words = [w for w in words if w not in self.stop_words and len(w) > 2]

        return ' '.join(words)

    def combine_features(self, anime_data: Dict) -> str:
        """
        Combine genres, themes, and synopsis into a single text feature.

        Strategy:
        - Genres are repeated 3x (higher weight for genre matching)
        - Themes are repeated 2x (medium weight)
        - Synopsis is included once (lower weight but more context)

        Args:
            anime_data: Dictionary containing anime information

        Returns:
            Combined text string for TF-IDF vectorization
        """
        # Extract and clean each component
        genres = self.clean_text(anime_data.get('genres', ''))
        themes = self.clean_text(anime_data.get('themes', ''))
        synopsis = self.clean_text(anime_data.get('synopsis', ''))

        # Combine with different weights
        # Genres have highest importance, then themes, then synopsis
        combined = []

        # Add genres 3 times for higher weight
        if genres:
            combined.extend([genres] * 3)

        # Add themes 2 times for medium weight
        if themes:
            combined.extend([themes] * 2)

        # Add synopsis once for context
        if synopsis:
            combined.append(synopsis)

        return ' '.join(combined)

    def process_anime_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process entire anime dataframe.

        Args:
            df: DataFrame with columns: anime_id, title, genres, themes, synopsis, popularity_score

        Returns:
            DataFrame with added 'combined_features' column
        """
        # Create a copy to avoid modifying original
        processed_df = df.copy()

        # Fill NaN values
        processed_df['genres'] = processed_df['genres'].fillna('')
        processed_df['themes'] = processed_df['themes'].fillna('')
        processed_df['synopsis'] = processed_df['synopsis'].fillna('')

        # Combine features for each anime
        print("🔄 Preprocessing anime data...")
        processed_df['combined_features'] = processed_df.apply(
            lambda row: self.combine_features({
                'genres': row['genres'],
                'themes': row['themes'],
                'synopsis': row['synopsis']
            }),
            axis=1
        )

        print(f"✅ Processed {len(processed_df)} anime records")
        return processed_df

    def extract_genre_list(self, genres_str: str) -> List[str]:
        """
        Extract individual genres from comma-separated string.

        Args:
            genres_str: Comma-separated genre string

        Returns:
            List of individual genres
        """
        if not isinstance(genres_str, str) or not genres_str:
            return []

        genres = [g.strip().lower() for g in genres_str.split(',')]
        return [g for g in genres if g]

    def get_diverse_genres(self, df: pd.DataFrame, n: int = 5) -> List[str]:
        """
        Get most common genres for diversity recommendations.

        Args:
            df: Anime dataframe
            n: Number of top genres to return

        Returns:
            List of most common genres
        """
        all_genres = []
        for genres_str in df['genres'].dropna():
            all_genres.extend(self.extract_genre_list(genres_str))

        # Count genre frequencies
        from collections import Counter
        genre_counts = Counter(all_genres)

        # Return top N genres
        top_genres = [genre for genre, count in genre_counts.most_common(n)]
        return top_genres


# Example usage and testing
if __name__ == "__main__":
    # Sample data for testing
    sample_data = {
        'anime_id': [1, 2, 3],
        'title': ['Naruto', 'Attack on Titan', 'Death Note'],
        'genres': ['Action, Adventure, Shounen', 'Action, Drama, Fantasy', 'Mystery, Psychological, Thriller'],
        'themes': ['Ninja, Friendship', 'Survival, Military', 'Detective, Mind Games'],
        'synopsis': [
            'A young ninja seeks recognition',
            'Humanity fights against giant titans',
            'A student finds a notebook that kills'
        ],
        'popularity_score': [95, 98, 97]
    }

    df = pd.DataFrame(sample_data)

    # Test preprocessing
    preprocessor = AnimePreprocessor()
    processed_df = preprocessor.process_anime_dataframe(df)

    print("\n📊 Sample processed data:")
    print(processed_df[['title', 'combined_features']].head())

    print("\n🎭 Top genres:")
    print(preprocessor.get_diverse_genres(processed_df))
