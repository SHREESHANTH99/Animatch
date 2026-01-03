"""
Load anime data from MongoDB for recommendation system
"""
import pandas as pd
from pymongo import MongoClient
import os

def load_anime_from_mongodb(mongodb_uri):
    """Load anime data from MongoDB."""
    print("📡 Connecting to MongoDB...")
    client = MongoClient(mongodb_uri)
    db = client['animatch']  # Your database name
    
    # Load anime
    print("📺 Loading anime data...")
    anime_collection = db['animes']
    anime_cursor = anime_collection.find()
    anime_df = pd.DataFrame(list(anime_cursor))
    
    if '_id' in anime_df.columns:
        anime_df = anime_df.drop('_id', axis=1)
    
    # Ensure required columns exist
    required_columns = ['anime_id', 'title', 'genres', 'synopsis', 'popularity_score']
    for col in required_columns:
        if col not in anime_df.columns:
            if col == 'themes':
                anime_df['themes'] = ''
            elif col == 'synopsis':
                anime_df['synopsis'] = anime_df.get('description', '')
            elif col == 'popularity_score':
                anime_df['popularity_score'] = 50
    
    print(f"✅ Loaded {len(anime_df)} anime")
    
    # Load interactions
    print("💫 Loading interactions...")
    interaction_collection = db['interactions']
    interactions_cursor = interaction_collection.find()
    interactions_df = pd.DataFrame(list(interactions_cursor))
    
    if '_id' in interactions_df.columns:
        interactions_df = interactions_df.drop('_id', axis=1)
    
    # If no interactions, create empty dataframe with correct schema
    if len(interactions_df) == 0:
        interactions_df = pd.DataFrame(columns=['user_id', 'anime_id', 'interaction_type', 'timestamp'])
    
    print(f"✅ Loaded {len(interactions_df)} interactions")
    
    client.close()
    
    return anime_df, interactions_df

if __name__ == "__main__":
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/animatch')
    anime_df, interactions_df = load_anime_from_mongodb(mongodb_uri)
    
    print("\n📊 Anime DataFrame:")
    print(anime_df.head())
    print(f"\nColumns: {anime_df.columns.tolist()}")
    print(f"\nTotal anime: {len(anime_df)}")
    
    print("\n💫 Interactions DataFrame:")
    print(interactions_df.head())
    print(f"\nTotal interactions: {len(interactions_df)}")
