"""
start_api.py
Start the Recommendation API with MongoDB data
"""

import os
import sys
from flask import Flask
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(env_path)

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from api import app, api, interactions_df
from load_from_mongodb import load_anime_from_mongodb

# Import global variable setter
import api as api_module

def main():
    """Load data from MongoDB and start the API server."""
    
    print("=" * 60)
    print("🚀 ANIME RECOMMENDATION API")
    print("=" * 60)
    
    # Get MongoDB URI from environment
    mongodb_uri = os.getenv('MONGODB_URI')
    
    if not mongodb_uri:
        print("❌ Error: MONGODB_URI environment variable not set")
        print("   Please set it in your .env file")
        sys.exit(1)
    
    print(f"🔗 Connecting to MongoDB...")
    
    try:
        # Load data from MongoDB
        anime_df, interaction_df = load_anime_from_mongodb(mongodb_uri)
        
        print(f"\n📊 Data loaded:")
        print(f"   - Anime: {len(anime_df)}")
        print(f"   - Interactions: {len(interaction_df)}")
        
        if len(anime_df) == 0:
            print("\n❌ Error: No anime data found in database")
            print("   Please run: node scripts/import_anime_data.js")
            sys.exit(1)
        
        # Initialize the recommendation system
        print("\n🔄 Initializing recommendation system...")
        api_module.interactions_df = interaction_df
        api.initialize(anime_df, interaction_df)
        
        print("\n✅ Initialization complete!")
        
        # Get port from environment or use default
        port = int(os.getenv('PYTHON_API_PORT', '5002'))
        
        print(f"\n{'=' * 60}")
        print(f"🎯 API Server starting on http://localhost:{port}")
        print(f"{'=' * 60}")
        print("\nAvailable endpoints:")
        print(f"  - GET  /api/recommend/health")
        print(f"  - GET  /api/recommend/user/<user_id>?top_n=10")
        print(f"  - GET  /api/recommend/similar/<anime_id>?top_n=10")
        print(f"\n{'=' * 60}\n")
        
        # Start Flask server
        app.run(
            host='0.0.0.0',
            port=port,
            debug=False,
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down API server...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        print("\n📋 Full traceback:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
