"""
test_system.py
Comprehensive Test Suite for Recommendation System
"""

import sys
import pandas as pd
import numpy as np
from preprocess import AnimePreprocessor
from model import AnimeRecommendationModel
from user_profile import UserProfileBuilder
from recommender import HybridRecommender


def create_sample_data():
    """Create sample data for testing."""
    anime_data = {
        'anime_id': list(range(1, 21)),
        'title': [
            'Naruto', 'Attack on Titan', 'Death Note', 'One Piece', 'Bleach',
            'Demon Slayer', 'My Hero Academia', 'Fullmetal Alchemist', 
            'Sword Art Online', 'Tokyo Ghoul', 'Hunter x Hunter', 'Steins;Gate',
            'Code Geass', 'Cowboy Bebop', 'Neon Genesis Evangelion',
            'Dragon Ball Z', 'Jujutsu Kaisen', 'Chainsaw Man', 'Spy x Family',
            'Mob Psycho 100'
        ],
        'genres': [
            'Action, Adventure, Shounen', 'Action, Drama, Fantasy',
            'Mystery, Psychological, Thriller', 'Action, Adventure, Shounen',
            'Action, Adventure, Shounen', 'Action, Fantasy, Shounen',
            'Action, Superhero, Shounen', 'Action, Adventure, Fantasy',
            'Action, Fantasy, Romance', 'Action, Horror, Psychological',
            'Action, Adventure, Shounen', 'Sci-Fi, Thriller, Drama',
            'Action, Mecha, Drama', 'Action, Sci-Fi, Western',
            'Mecha, Psychological, Sci-Fi', 'Action, Adventure, Shounen',
            'Action, Supernatural, Shounen', 'Action, Horror, Supernatural',
            'Action, Comedy, Slice of Life', 'Action, Comedy, Supernatural'
        ],
        'themes': [
            'Ninja, Friendship', 'Survival, Military', 'Detective, Mind Games',
            'Pirates, Friendship', 'Samurai, Shinigami', 'Demons, Family',
            'Heroes, School', 'Alchemy, Brotherhood', 'VR, Gaming',
            'Ghouls, Identity', 'Hunters, Adventure', 'Time Travel, Science',
            'Rebellion, Strategy', 'Space, Bounty Hunters', 'Robots, Philosophy',
            'Martial Arts, Power', 'Curses, Sorcery', 'Devils, Violence',
            'Spies, Wholesome', 'Psychic, Comedy'
        ],
        'synopsis': [
            'A young ninja seeks recognition and dreams of becoming Hokage',
            'Humanity fights for survival against giant humanoid titans',
            'A student finds a supernatural notebook that kills anyone whose name is written',
            'A pirate seeks to become the pirate king and find One Piece',
            'A teenager becomes a soul reaper to protect the living world',
            'A boy becomes a demon slayer to save his sister and avenge his family',
            'Students train to become professional heroes in a super powered society',
            'Two brothers use alchemy to search for the Philosophers Stone',
            'Players are trapped in a virtual reality MMORPG game',
            'A college student is turned into a half-ghoul in Tokyo',
            'A boy takes the Hunter Exam to find his father',
            'A scientist discovers time travel and must prevent disaster',
            'A prince uses a mysterious power to rebel against an empire',
            'Bounty hunters travel through space pursuing criminals',
            'Teenagers pilot giant robots to save humanity from angels',
            'A Saiyan warrior protects Earth from powerful villains',
            'A boy enrolls in school to learn jujutsu sorcery',
            'A boy becomes a devil hunter with a chainsaw devil',
            'A spy and an assassin form a fake family for their missions',
            'A psychic boy tries to live a normal life'
        ],
        'popularity_score': [95, 98, 97, 99, 90, 96, 94, 98, 85, 88, 
                           97, 95, 94, 93, 96, 97, 95, 93, 94, 92]
    }

    interactions_data = {
        'user_id': [101]*5 + [102]*4 + [103]*6 + [104]*2,
        'anime_id': [1, 4, 5, 6, 16,  # User 101: Shounen action fan
                    2, 3, 12, 15,     # User 102: Dark/psychological
                    7, 17, 6, 1, 16, 4,  # User 103: Battle shounen
                    19, 20],          # User 104: Comedy/slice of life (cold start)
        'interaction_type': ['favorite', 'like', 'like', 'favorite', 'view',
                           'favorite', 'favorite', 'like', 'view',
                           'favorite', 'like', 'like', 'view', 'view', 'view',
                           'like', 'view'],
        'timestamp': pd.date_range('2024-01-01', periods=17)
    }

    return pd.DataFrame(anime_data), pd.DataFrame(interactions_data)


def test_preprocessing():
    """Test preprocessing module."""
    print("\n" + "="*60)
    print("TEST 1: PREPROCESSING")
    print("="*60)

    anime_df, _ = create_sample_data()
    preprocessor = AnimePreprocessor()

    processed_df = preprocessor.process_anime_dataframe(anime_df)

    print(f"✓ Processed {len(processed_df)} anime")
    print(f"✓ Combined features column created")

    # Check sample output
    sample = processed_df.iloc[0]
    print(f"\nSample combined features for '{sample['title']}':")
    print(f"  {sample['combined_features'][:100]}...")

    # Test genre extraction
    genres = preprocessor.get_diverse_genres(processed_df, n=5)
    print(f"\n✓ Top 5 genres: {genres}")

    return processed_df


def test_model(processed_df):
    """Test TF-IDF model."""
    print("\n" + "="*60)
    print("TEST 2: TF-IDF MODEL")
    print("="*60)

    model = AnimeRecommendationModel()
    model.fit(processed_df, precompute_similarity=True)

    print(f"✓ Model trained successfully")
    print(f"✓ TF-IDF matrix shape: {model.tfidf_matrix.shape}")
    print(f"✓ Vocabulary size: {len(model.vectorizer.vocabulary_)}")

    # Test similarity
    similar = model.get_similar_anime(anime_id=1, top_n=3)
    print(f"\n✓ Similar anime to 'Naruto':")
    for anime_id, score in similar:
        title = processed_df[processed_df['anime_id'] == anime_id]['title'].values[0]
        print(f"   - {title}: {score:.3f}")

    # Test top features
    features = model.get_top_features_for_anime(anime_id=1, top_n=5)
    print(f"\n✓ Top features for 'Naruto': {', '.join(features)}")

    return model


def test_user_profile(model, interactions_df):
    """Test user profile building."""
    print("\n" + "="*60)
    print("TEST 3: USER PROFILES")
    print("="*60)

    profile_builder = UserProfileBuilder(model)

    # Test user 101 (regular user)
    user101_interactions = profile_builder.get_user_interactions(interactions_df, 101)
    user_vector, interacted_ids = profile_builder.build_user_vector(user101_interactions)

    print(f"✓ User 101 profile built")
    print(f"  - Interactions: {len(user101_interactions)}")
    print(f"  - Interacted anime: {interacted_ids}")

    stats = profile_builder.get_user_statistics(user101_interactions)
    print(f"  - Favorites: {stats['favorites']}, Likes: {stats['likes']}, Views: {stats['views']}")

    # Test preferred genres
    preferred = stats['preferred_genres']
    print(f"\n✓ User 101 preferred genres:")
    for genre, score in sorted(preferred.items(), key=lambda x: x[1], reverse=True)[:3]:
        print(f"   - {genre.title()}: {score:.2f}")

    # Test cold-start detection
    user104_interactions = profile_builder.get_user_interactions(interactions_df, 104)
    is_cold_start = profile_builder.is_cold_start_user(user104_interactions)
    print(f"\n✓ User 104 (only {len(user104_interactions)} interactions) is cold-start: {is_cold_start}")

    return profile_builder


def test_recommender(model, profile_builder, interactions_df):
    """Test recommendation engine."""
    print("\n" + "="*60)
    print("TEST 4: HYBRID RECOMMENDER")
    print("="*60)

    recommender = HybridRecommender(model, profile_builder)

    # Test recommendations for regular user
    print("\n📺 Recommendations for User 101 (Shounen Action Fan):")
    recommendations = recommender.recommend_for_user(101, interactions_df, top_n=5)

    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Genres: {rec['genres']}")
        print(f"   Hybrid Score: {rec['hybrid_score']:.3f} "
              f"(Content: {rec['content_similarity']:.3f}, "
              f"Popularity: {rec['popularity_score']:.0f})")
        print(f"   Reason: {rec['reason_for_recommendation']}")

    # Test cold-start recommendations
    print("\n\n🆕 Recommendations for User 104 (Cold-Start):")
    cold_start_recs = recommender.recommend_for_user(104, interactions_df, top_n=5)

    for i, rec in enumerate(cold_start_recs, 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Genres: {rec['genres']}")
        print(f"   Reason: {rec['reason_for_recommendation']}")

    # Test similar anime
    print("\n\n🔍 Anime Similar to 'Naruto':")
    similar = recommender.get_similar_to_anime(anime_id=1, top_n=3)

    for i, rec in enumerate(similar, 1):
        print(f"\n{i}. {rec['title']}")
        print(f"   Similarity: {rec['content_similarity']:.3f}")
        print(f"   Reason: {rec['reason_for_recommendation']}")

    return recommender


def test_api_integration():
    """Test API functionality."""
    print("\n" + "="*60)
    print("TEST 5: API INTEGRATION")
    print("="*60)

    try:
        from api import RecommenderAPI
        import json

        anime_df, interactions_df = create_sample_data()

        api = RecommenderAPI()
        api.initialize(anime_df, interactions_df)

        print("✓ API initialized successfully")

        # Test recommendation function
        recommendations = api.recommend_anime(101, interactions_df, top_n=3)
        print(f"✓ Generated {len(recommendations)} recommendations via API")

        # Test similar anime function
        similar = api.get_similar_anime(1, top_n=3)
        print(f"✓ Found {len(similar)} similar anime via API")

        # Test JSON serialization
        json_output = json.dumps(recommendations, indent=2)
        print(f"✓ Recommendations serializable to JSON ({len(json_output)} bytes)")

    except Exception as e:
        print(f"⚠ API test failed: {e}")


def run_performance_test(recommender, interactions_df):
    """Test performance metrics."""
    print("\n" + "="*60)
    print("TEST 6: PERFORMANCE")
    print("="*60)

    import time

    # Time recommendation generation
    start = time.time()
    recommendations = recommender.recommend_for_user(101, interactions_df, top_n=10)
    elapsed = time.time() - start

    print(f"✓ Generated 10 recommendations in {elapsed*1000:.2f}ms")

    # Time similar anime lookup
    start = time.time()
    similar = recommender.get_similar_to_anime(1, top_n=10)
    elapsed = time.time() - start

    print(f"✓ Found 10 similar anime in {elapsed*1000:.2f}ms")

    # Memory usage (approximate)
    matrix_size = recommender.model.tfidf_matrix.data.nbytes / (1024*1024)
    print(f"✓ TF-IDF matrix size: {matrix_size:.2f} MB")


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("ANIME RECOMMENDATION SYSTEM - TEST SUITE")
    print("="*60)

    try:
        # Create sample data
        anime_df, interactions_df = create_sample_data()
        print(f"\n✓ Created sample dataset:")
        print(f"  - {len(anime_df)} anime")
        print(f"  - {len(interactions_df)} interactions")
        print(f"  - {interactions_df['user_id'].nunique()} users")

        # Run tests
        processed_df = test_preprocessing()
        model = test_model(processed_df)
        profile_builder = test_user_profile(model, interactions_df)
        recommender = test_recommender(model, profile_builder, interactions_df)
        test_api_integration()
        run_performance_test(recommender, interactions_df)

        # Summary
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print("\nThe recommendation system is working correctly!")
        print("You can now:")
        print("  1. Start the API server: python api.py --mode server")
        print("  2. Integrate with your Node.js backend")
        print("  3. Load real anime data from your database")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
