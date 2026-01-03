"""
model.py
TF-IDF Vectorization and Similarity Computation

This module creates and stores the TF-IDF matrix for anime content.
Uses cosine similarity for efficient similarity calculations.
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple, Dict
import pickle
import os


class AnimeRecommendationModel:
    """
    Content-based recommendation model using TF-IDF and cosine similarity.
    """

    def __init__(self, max_features: int = 5000, min_df: int = 1, max_df: float = 0.8):
        """
        Initialize the TF-IDF model.

        Args:
            max_features: Maximum number of features to extract
            min_df: Minimum document frequency (ignore rare terms)
            max_df: Maximum document frequency (ignore very common terms)
        """
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            min_df=min_df,
            max_df=max_df,
            ngram_range=(1, 2),  # Unigrams and bigrams
            stop_words='english'
        )

        self.tfidf_matrix = None
        self.anime_indices = None  # Maps anime_id to matrix index
        self.index_to_anime = None  # Maps matrix index to anime_id
        self.anime_data = None
        self.similarity_matrix = None

    def fit(self, df: pd.DataFrame, precompute_similarity: bool = False):
        """
        Fit the TF-IDF model on anime data.

        Args:
            df: DataFrame with 'anime_id' and 'combined_features' columns
            precompute_similarity: Whether to precompute full similarity matrix
        """
        print("🔄 Training TF-IDF model...")

        # Store anime data
        self.anime_data = df.copy()

        # Create anime_id to index mapping
        self.anime_indices = {
            anime_id: idx for idx, anime_id in enumerate(df['anime_id'])
        }
        self.index_to_anime = {
            idx: anime_id for anime_id, idx in self.anime_indices.items()
        }

        # Fit and transform the combined features
        combined_features = df['combined_features'].fillna('').tolist()
        self.tfidf_matrix = self.vectorizer.fit_transform(combined_features)

        print(f"✅ TF-IDF matrix shape: {self.tfidf_matrix.shape}")
        print(f"📊 Vocabulary size: {len(self.vectorizer.vocabulary_)}")

        # Optionally precompute similarity matrix for speed
        # (Only do this if dataset is small enough to fit in memory)
        if precompute_similarity:
            print("🔄 Precomputing similarity matrix...")
            self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
            print("✅ Similarity matrix computed")

    def get_similar_anime(
        self,
        anime_id: int,
        top_n: int = 10,
        exclude_ids: List[int] = None
    ) -> List[Tuple[int, float]]:
        """
        Find similar anime based on content.

        Args:
            anime_id: Target anime ID
            top_n: Number of similar anime to return
            exclude_ids: List of anime IDs to exclude from results

        Returns:
            List of tuples (anime_id, similarity_score)
        """
        if anime_id not in self.anime_indices:
            return []

        idx = self.anime_indices[anime_id]

        # Compute similarity scores
        if self.similarity_matrix is not None:
            # Use precomputed matrix
            similarity_scores = self.similarity_matrix[idx]
        else:
            # Compute on-the-fly (more memory efficient)
            anime_vector = self.tfidf_matrix[idx]
            similarity_scores = cosine_similarity(
                anime_vector, self.tfidf_matrix
            )[0]

        # Create list of (index, score) tuples
        similar_indices = list(enumerate(similarity_scores))

        # Sort by similarity score (descending)
        similar_indices = sorted(similar_indices, key=lambda x: x[1], reverse=True)

        # Exclude the anime itself and any specified exclusions
        exclude_ids = exclude_ids or []
        exclude_ids.append(anime_id)

        results = []
        for idx, score in similar_indices:
            aid = self.index_to_anime[idx]
            if aid not in exclude_ids and score > 0:
                results.append((aid, float(score)))
                if len(results) >= top_n:
                    break

        return results

    def get_similarity_score(self, anime_id1: int, anime_id2: int) -> float:
        """
        Get similarity score between two anime.

        Args:
            anime_id1: First anime ID
            anime_id2: Second anime ID

        Returns:
            Cosine similarity score (0 to 1)
        """
        if anime_id1 not in self.anime_indices or anime_id2 not in self.anime_indices:
            return 0.0

        idx1 = self.anime_indices[anime_id1]
        idx2 = self.anime_indices[anime_id2]

        if self.similarity_matrix is not None:
            return float(self.similarity_matrix[idx1][idx2])
        else:
            vec1 = self.tfidf_matrix[idx1]
            vec2 = self.tfidf_matrix[idx2]
            return float(cosine_similarity(vec1, vec2)[0][0])

    def get_anime_vector(self, anime_id: int):
        """
        Get TF-IDF vector for a specific anime.

        Args:
            anime_id: Anime ID

        Returns:
            TF-IDF vector (sparse matrix)
        """
        if anime_id not in self.anime_indices:
            return None

        idx = self.anime_indices[anime_id]
        return self.tfidf_matrix[idx]

    def transform_text(self, text: str):
        """
        Transform a text string into TF-IDF vector.
        Useful for creating user profile vectors.

        Args:
            text: Text to transform

        Returns:
            TF-IDF vector
        """
        return self.vectorizer.transform([text])

    def save_model(self, filepath: str):
        """
        Save the trained model to disk.

        Args:
            filepath: Path to save the model
        """
        model_data = {
            'vectorizer': self.vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'anime_indices': self.anime_indices,
            'index_to_anime': self.index_to_anime,
            'anime_data': self.anime_data,
            'similarity_matrix': self.similarity_matrix
        }

        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        print(f"✅ Model saved to {filepath}")

    def load_model(self, filepath: str):
        """
        Load a trained model from disk.

        Args:
            filepath: Path to the saved model
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")

        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.vectorizer = model_data['vectorizer']
        self.tfidf_matrix = model_data['tfidf_matrix']
        self.anime_indices = model_data['anime_indices']
        self.index_to_anime = model_data['index_to_anime']
        self.anime_data = model_data['anime_data']
        self.similarity_matrix = model_data.get('similarity_matrix')

        print(f"✅ Model loaded from {filepath}")
        print(f"📊 Loaded {len(self.anime_indices)} anime")

    def get_top_features_for_anime(self, anime_id: int, top_n: int = 10) -> List[str]:
        """
        Get the top TF-IDF features (keywords) for an anime.
        Useful for explainability.

        Args:
            anime_id: Anime ID
            top_n: Number of top features to return

        Returns:
            List of top feature words
        """
        if anime_id not in self.anime_indices:
            return []

        idx = self.anime_indices[anime_id]
        vector = self.tfidf_matrix[idx].toarray()[0]

        # Get indices of top features
        top_indices = np.argsort(vector)[-top_n:][::-1]

        # Get feature names
        feature_names = self.vectorizer.get_feature_names_out()
        top_features = [feature_names[i] for i in top_indices if vector[i] > 0]

        return top_features


# Example usage and testing
if __name__ == "__main__":
    from preprocess import AnimePreprocessor

    # Sample data
    sample_data = {
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

    df = pd.DataFrame(sample_data)

    # Preprocess data
    preprocessor = AnimePreprocessor()
    processed_df = preprocessor.process_anime_dataframe(df)

    # Train model
    model = AnimeRecommendationModel()
    model.fit(processed_df, precompute_similarity=True)

    # Test similarity
    print("\n🔍 Similar anime to Naruto:")
    similar = model.get_similar_anime(anime_id=1, top_n=3)
    for anime_id, score in similar:
        title = df[df['anime_id'] == anime_id]['title'].values[0]
        print(f"  - {title}: {score:.3f}")

    print("\n🎯 Top features for Naruto:")
    features = model.get_top_features_for_anime(anime_id=1, top_n=5)
    print(f"  {', '.join(features)}")
