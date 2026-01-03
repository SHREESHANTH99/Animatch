# 🏗️ AI Recommendation System Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Port 3000)                   │ │
│  │                                                                  │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐ │ │
│  │  │ AIRecommendations│  │ RecommendationCard│  │  SimilarAnime │ │ │
│  │  │      Page        │  │    Component      │  │   Component   │ │ │
│  │  └────────┬─────────┘  └─────────┬────────┘  └───────┬───────┘ │ │
│  │           │                      │                     │         │ │
│  │           └──────────────────────┼─────────────────────┘         │ │
│  │                                  │                               │ │
│  └──────────────────────────────────┼───────────────────────────────┘ │
│                                     │                                 │
└─────────────────────────────────────┼─────────────────────────────────┘
                                      │
                                      │ axios HTTP requests
                                      │
┌─────────────────────────────────────▼─────────────────────────────────┐
│                   Node.js Express Backend (Port 5001)                  │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    recommendationRoutes.js                        │ │
│  │                                                                    │ │
│  │  GET /api/recommendations/user/:userId                            │ │
│  │  GET /api/recommendations/similar/:animeId                        │ │
│  │  POST /api/recommendations/initialize                             │ │
│  │  GET /api/recommendations/health                                  │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │                                         │
│  ┌────────────────────────────┼───────────────────────────────────┐   │
│  │  Other Routes:             │                                    │   │
│  │  - authRoutes              │  MongoDB                           │   │
│  │  - userRoutes        ──────┼─►(User interactions,               │   │
│  │  - libraryRoutes           │   anime data)                      │   │
│  │  - postRoutes              │                                    │   │
│  └────────────────────────────┼───────────────────────────────────┘   │
└───────────────────────────────┼───────────────────────────────────────┘
                                │
                                │ axios HTTP requests
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│               Python Flask API (Port 5000)                             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                          api.py                                   │ │
│  │                                                                    │ │
│  │  POST /api/recommend/user/:userId                                 │ │
│  │  POST /api/recommend/similar/:animeId                             │ │
│  │  POST /api/recommend/initialize                                   │ │
│  │  GET  /api/recommend/health                                       │ │
│  └────────────────────────┬───────────────────────────────────────────┘ │
│                           │                                             │
│  ┌────────────────────────┼─────────────────────────────────────────┐ │
│  │   ML Engine Components │                                          │ │
│  │                        │                                          │ │
│  │  ┌─────────────────────▼────────┐  ┌──────────────────────────┐ │ │
│  │  │   AnimePreprocessor          │  │  AnimeRecommendation     │ │ │
│  │  │   (preprocess.py)            │  │  Model (model.py)        │ │ │
│  │  │                               │  │                          │ │ │
│  │  │  - Clean text                │  │  - TF-IDF vectorization  │ │ │
│  │  │  - Combine features          │  │  - Cosine similarity     │ │ │
│  │  │  - Weight: genres 3x         │  │  - Similarity matrix     │ │ │
│  │  │            themes 2x         │  │  - Cache management      │ │ │
│  │  │            synopsis 1x       │  │                          │ │ │
│  │  └──────────────────────────────┘  └──────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────┐ │ │
│  │  │   UserProfileBuilder         │  │  HybridRecommender       │ │ │
│  │  │   (user_profile.py)          │  │  (recommender.py)        │ │ │
│  │  │                               │  │                          │ │ │
│  │  │  - Build user vectors        │  │  - Hybrid scoring        │ │ │
│  │  │  - Weight interactions       │  │    (60% content +        │ │ │
│  │  │    favorites: 3.0            │  │     40% popularity)      │ │ │
│  │  │    likes: 2.0                │  │  - Diversity filter      │ │ │
│  │  │    views: 1.0                │  │  - Generate reasons      │ │ │
│  │  │  - Cold-start detection      │  │  - Rank results          │ │ │
│  │  └──────────────────────────────┘  └──────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────┐ │ │
│  │  │   Config (config.py)         │  │  Utils (utils.py)        │ │ │
│  │  │   - Algorithm parameters     │  │  - Helper functions      │ │ │
│  │  └──────────────────────────────┘  └──────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Recommendation Flow

```
1. User clicks "AI Picks" in navbar
   ↓
2. AIRecommendations.jsx loads
   ↓
3. api.get('/api/recommendations/user/:userId')
   ↓
4. Node.js: recommendationRoutes.js receives request
   ↓
5. axios.get('http://localhost:5000/api/recommend/user/:userId')
   ↓
6. Python Flask: api.py receives request
   ↓
7. Load user interactions from MongoDB
   ↓
8. UserProfileBuilder.build_user_vector()
   ↓
9. HybridRecommender.recommend_for_user()
   ↓
10. AnimeRecommendationModel.get_similar_anime()
    ↓
11. Calculate: 0.6 × content_similarity + 0.4 × popularity
    ↓
12. Filter diversity, remove watched anime
    ↓
13. Return top N recommendations with reasons
    ↓
14. Node.js forwards response to frontend
    ↓
15. React displays RecommendationCard components
```

### Similar Anime Flow

```
1. User views anime details page
   ↓
2. SimilarAnime.jsx loads with animeId
   ↓
3. api.get('/api/recommendations/similar/:animeId')
   ↓
4. Node.js forwards to Python Flask
   ↓
5. AnimeRecommendationModel.get_similar_anime(animeId)
   ↓
6. Calculate cosine similarity with all anime
   ↓
7. Return top 6 most similar
   ↓
8. Display in grid with match percentages
```

## Technology Stack

### Frontend Layer

- **Framework:** React 19.1.0
- **Routing:** React Router DOM 7.6.3
- **Animations:** Framer Motion 12.23.0
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend Layer (Node.js)

- **Framework:** Express 5.1.0
- **Database:** MongoDB (Mongoose 8.16.3)
- **Real-time:** Socket.IO 4.8.1
- **Auth:** JWT (jsonwebtoken 9.0.2)
- **HTTP Client:** Axios

### ML Layer (Python)

- **Framework:** Flask 2.3.0+
- **ML Library:** scikit-learn 1.3.0+
- **Data Processing:** Pandas 2.0.0+, NumPy 1.24.0+
- **Math:** SciPy 1.11.0+
- **Database:** PyMongo (for MongoDB)

## Component Responsibilities

### Frontend Components

| Component              | Responsibility  | Key Features                                |
| ---------------------- | --------------- | ------------------------------------------- |
| AIRecommendations.jsx  | Main page       | Filtering, loading states, grid layout      |
| RecommendationCard.jsx | Display anime   | Rank badges, scores, reasons, hover effects |
| SimilarAnime.jsx       | Related content | Compact cards, quick navigation             |
| Navbar.jsx             | Navigation      | "AI Picks" link with sparkles icon          |

### Backend Routes

| Route                                 | Method | Purpose                          |
| ------------------------------------- | ------ | -------------------------------- |
| /api/recommendations/user/:userId     | GET    | Get personalized recommendations |
| /api/recommendations/similar/:animeId | GET    | Get similar anime                |
| /api/recommendations/initialize       | POST   | Refresh ML model                 |
| /api/recommendations/health           | GET    | Service status check             |

### Python ML Modules

| Module          | Class/Function           | Purpose                          |
| --------------- | ------------------------ | -------------------------------- |
| preprocess.py   | AnimePreprocessor        | Clean and combine text features  |
| model.py        | AnimeRecommendationModel | TF-IDF vectorization, similarity |
| user_profile.py | UserProfileBuilder       | Build user preference vectors    |
| recommender.py  | HybridRecommender        | Main recommendation engine       |
| config.py       | Config                   | Algorithm parameters             |
| utils.py        | Helper functions         | Caching, metrics, formatting     |
| api.py          | Flask routes             | REST API endpoints               |

## Ports & URLs

| Service         | Port  | URL                       | Purpose        |
| --------------- | ----- | ------------------------- | -------------- |
| React Frontend  | 3000  | http://localhost:3000     | User interface |
| Node.js Backend | 5001  | http://localhost:5001     | API gateway    |
| Python Flask    | 5000  | http://localhost:5000     | ML service     |
| MongoDB         | 27017 | mongodb://localhost:27017 | Database       |

## Security Layers

```
User Request
    ↓
[Frontend Auth Check] - JWT token validation
    ↓
[Backend Auth Middleware] - Verify user session
    ↓
[Input Validation] - Sanitize parameters
    ↓
[Rate Limiting] - Prevent abuse
    ↓
[Service Communication] - Internal network only
    ↓
[Database Access] - Authorized queries only
```

## Performance Optimization

### Frontend

- ✅ Lazy loading with React.lazy()
- ✅ Code splitting by route
- ✅ Framer Motion animations
- ✅ Debounced filter changes

### Backend

- ✅ Connection pooling (Express)
- ✅ Request timeout (30s)
- ✅ Error handling and retries
- ✅ Response caching headers

### ML Service

- ✅ Precomputed similarity matrix
- ✅ Vectorized operations (NumPy)
- ✅ Sparse matrix storage
- ✅ Model persistence (pickle)

## Scaling Strategy

### Horizontal Scaling

```
Load Balancer
    ↓
┌───────────┬───────────┬───────────┐
│  Node.js  │  Node.js  │  Node.js  │
│ Instance1 │ Instance2 │ Instance3 │
└─────┬─────┴─────┬─────┴─────┬─────┘
      │           │           │
      └───────────┼───────────┘
                  ↓
         ┌────────────────┐
         │  Python Flask  │
         │  (Gunicorn)    │
         │  4 workers     │
         └────────┬───────┘
                  ↓
         ┌────────────────┐
         │    MongoDB     │
         │   Replica Set  │
         └────────────────┘
```

## Monitoring Points

1. **Frontend Metrics**

   - Page load time
   - API response time
   - Component render time
   - User interactions

2. **Backend Metrics**

   - Request rate
   - Error rate
   - Response time
   - Active connections

3. **ML Service Metrics**
   - Recommendation latency
   - Model accuracy
   - Cache hit rate
   - Resource usage

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Python dependencies installed
- [ ] Node.js dependencies installed
- [ ] MongoDB indexes created
- [ ] Flask API running
- [ ] Node.js backend running
- [ ] React frontend built
- [ ] Health checks passing
- [ ] Error logging configured
- [ ] Rate limiting enabled

---

**This architecture provides a scalable, maintainable, and performant AI recommendation system!** 🚀
