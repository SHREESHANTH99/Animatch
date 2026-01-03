# Anime Recommendation System

A traditional machine learning-based recommendation system for anime using **TF-IDF vectorization** and **cosine similarity**. No LLMs or cloud AI services required.

## Features

- **Content-Based Filtering**: Uses TF-IDF on genres, themes, and synopsis
- **User Personalization**: Builds user profiles from interaction history
- **Hybrid Scoring**: Combines content similarity (60%) with popularity (40%)
- **Cold-Start Handling**: Smart recommendations for new users
- **Explainable**: Each recommendation includes a reason
- **Fast & Efficient**: Optimized for datasets up to 10,000 anime
- **REST API**: Flask-based API for easy integration

## Architecture

```
recommendation_system/
├── preprocess.py      # Text cleaning and feature combination
├── model.py           # TF-IDF vectorization and similarity
├── user_profile.py    # User preference vector construction
├── recommender.py     # Hybrid scoring and ranking logic
├── api.py             # Flask REST API endpoints
├── config.py          # Configuration settings
├── utils.py           # Utility functions
└── requirements.txt   # Python dependencies
```

## Installation

### 1. Install Dependencies

```bash
cd backend/recommendation_system
pip install -r requirements.txt
```

### 2. Verify Installation

```bash
python api.py --mode test
```

## Usage

### Method 1: Flask API Server (Recommended)

Start the API server:

```bash
python api.py --mode server --port 5001
```

The API will be available at `http://localhost:5001`

### Method 2: Direct Python Integration

```python
from recommendation_system import (
    AnimePreprocessor,
    AnimeRecommendationModel,
    UserProfileBuilder,
    HybridRecommender
)
import pandas as pd

# Load your data
anime_df = pd.read_csv('anime_data.csv')
interactions_df = pd.read_csv('user_interactions.csv')

# Initialize system
preprocessor = AnimePreprocessor()
processed_df = preprocessor.process_anime_dataframe(anime_df)

model = AnimeRecommendationModel()
model.fit(processed_df)

profile_builder = UserProfileBuilder(model)
recommender = HybridRecommender(model, profile_builder)

# Get recommendations
recommendations = recommender.recommend_for_user(
    user_id=101,
    interactions_df=interactions_df,
    top_n=10
)
```

### Method 3: Command Line

```bash
# Get recommendations for a user
python api.py --mode recommend \
  --user-id 101 \
  --top-n 10 \
  --anime-file data/anime.csv \
  --interaction-file data/interactions.csv
```

## API Endpoints

### 1. Get User Recommendations

```http
GET /api/recommendations/user/<user_id>?top_n=10
```

**Response:**

```json
{
  "user_id": 101,
  "recommendations": [
    {
      "anime_id": 42,
      "title": "Demon Slayer",
      "genres": "Action, Fantasy, Shounen",
      "hybrid_score": 0.856,
      "reason_for_recommendation": "Similar to anime you liked in Action, Fantasy genres"
    }
  ],
  "count": 10
}
```

### 2. Get Similar Anime

```http
GET /api/recommendations/similar/<anime_id>?top_n=10&exclude=1,2,3
```

**Response:**

```json
{
  "anime_id": 1,
  "similar_anime": [
    {
      "anime_id": 4,
      "title": "One Piece",
      "content_similarity": 0.782,
      "hybrid_score": 0.845,
      "reason_for_recommendation": "Shares similar themes: adventure, friendship"
    }
  ],
  "count": 10
}
```

### 3. Initialize System

```http
POST /api/recommendations/initialize
Content-Type: application/json

{
  "anime_data": [...],
  "interaction_data": [...]
}
```

### 4. Health Check

```http
GET /api/recommendations/health
```

## Data Format

### Anime Data (CSV or DataFrame)

Required columns:

- `anime_id` (int): Unique anime identifier
- `title` (string): Anime title
- `genres` (string): Comma-separated genres
- `themes` (string): Comma-separated themes
- `synopsis` (string): Brief description
- `popularity_score` (float): Popularity metric (0-100)

**Example:**

```csv
anime_id,title,genres,themes,synopsis,popularity_score
1,Naruto,"Action, Adventure, Shounen","Ninja, Friendship","A young ninja...",95
2,Attack on Titan,"Action, Drama, Fantasy","Survival, Military","Humanity fights...",98
```

### Interaction Data (CSV or DataFrame)

Required columns:

- `user_id` (int): User identifier
- `anime_id` (int): Anime identifier
- `interaction_type` (string): 'favorite', 'like', or 'view'
- `timestamp` (datetime): Interaction timestamp

**Example:**

```csv
user_id,anime_id,interaction_type,timestamp
101,1,favorite,2024-01-15 10:30:00
101,4,like,2024-01-16 14:20:00
102,2,favorite,2024-01-17 09:15:00
```

## Algorithm Details

### Content-Based Filtering

1. **Text Preprocessing**:

   - Combine genres (3x weight) + themes (2x weight) + synopsis (1x weight)
   - Clean and normalize text
   - Remove stop words

2. **TF-IDF Vectorization**:

   - Extract up to 5,000 features
   - Use unigrams and bigrams
   - Compute TF-IDF matrix for all anime

3. **Cosine Similarity**:
   - Measure content similarity between anime
   - Range: 0 (no similarity) to 1 (identical)

### User Personalization

1. **User Profile Vector**:

   - Get all anime user interacted with
   - Weight by interaction type:
     - Favorite: 3.0
     - Like: 2.0
     - View: 1.0
   - Average weighted TF-IDF vectors

2. **Similarity Computation**:
   - Compare user vector to all anime
   - Exclude already-seen anime

### Hybrid Scoring

```
Final Score = 0.6 × Content Similarity + 0.4 × Normalized Popularity
```

- **Content Similarity**: How well it matches user's taste
- **Popularity**: How popular/well-rated the anime is

### Cold-Start Strategy

For new users with < 3 interactions:

- Return diverse popular anime
- Ensure genre variety
- No personalization bias

## Configuration

Edit `config.py` to customize:

```python
# Scoring weights
CONTENT_WEIGHT = 0.6  # Content similarity weight
POPULARITY_WEIGHT = 0.4  # Popularity weight

# Interaction weights
INTERACTION_WEIGHTS = {
    'favorite': 3.0,
    'like': 2.0,
    'view': 1.0
}

# Cold-start threshold
COLD_START_THRESHOLD = 3  # Minimum interactions
```

## Integration with Node.js Backend

### Option 1: Flask API (Recommended)

Run Flask server and make HTTP requests from Node.js:

```javascript
// In your Express.js backend
const axios = require("axios");

async function getRecommendations(userId) {
  const response = await axios.get(
    `http://localhost:5001/api/recommendations/user/${userId}?top_n=10`
  );
  return response.data.recommendations;
}
```

### Option 2: Python Subprocess

Call Python directly from Node.js:

```javascript
const { spawn } = require("child_process");

function getRecommendations(userId, callback) {
  const python = spawn("python", [
    "recommendation_system/api.py",
    "--mode",
    "recommend",
    "--user-id",
    userId,
    "--top-n",
    "10",
    "--anime-file",
    "data/anime.csv",
    "--interaction-file",
    "data/interactions.csv",
  ]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.on("close", () => {
    callback(JSON.parse(result));
  });
}
```

## Performance

- **Dataset Size**: Optimized for up to 10,000 anime
- **Response Time**: < 100ms for recommendations (after initialization)
- **Memory Usage**: ~200MB for 10K anime (without precomputed similarity)
- **Initialization**: ~5-10 seconds for 10K anime

**Tips for Large Datasets**:

- Don't precompute full similarity matrix (save memory)
- Use on-the-fly similarity computation
- Cache user recommendations for 1-24 hours

## Testing

Run the test suite:

```bash
python api.py --mode test
```

Test individual modules:

```bash
python preprocess.py
python model.py
python user_profile.py
python recommender.py
```

## Troubleshooting

### Import Errors

```bash
# Make sure you're in the right directory
cd backend/recommendation_system

# Install dependencies
pip install -r requirements.txt
```

### Memory Issues

If you encounter memory errors with large datasets:

1. Set `precompute_similarity=False` in `model.py`
2. Reduce `MAX_FEATURES` in `config.py`
3. Process data in batches

### API Not Starting

Check if port is available:

```bash
# Linux/Mac
lsof -i :5001

# Windows
netstat -ano | findstr :5001
```

Use a different port:

```bash
python api.py --mode server --port 5002
```

## Future Enhancements

Potential improvements (not implemented):

- [ ] Collaborative filtering (user-user similarity)
- [ ] Matrix factorization (SVD)
- [ ] Temporal dynamics (trending anime)
- [ ] A/B testing framework
- [ ] Real-time model updates
- [ ] Redis caching layer
- [ ] Distributed processing

## License

This recommendation system is part of the ANIMATCH project.

## Credits

Built with:

- **scikit-learn**: Machine learning library
- **NumPy & Pandas**: Data processing
- **Flask**: Web framework

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: January 3, 2026
