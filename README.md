# AniMatch – Your Personalized Anime Hub

AniMatch is a full-stack anime web application that helps users discover, track, and interact with anime content. It's designed as a smart, modern alternative to platforms like MyAnimeList or AniList, featuring AI-based recommendations, user libraries, and an engaging community section.

**Tech Stack:** React, Tailwind, Node.js, Express, MongoDB, JWT, React Three Fiber (Three.js), Supabase (Google Auth)

---

## Features

### Landing Page
- Beautiful infinite carousel of top anime with their ratings

### Home Page
- 3D Anime Poster Cube built with @react-three/fiber and Three.js

### User Authentication
- Signup/Login (JWT-based)
- Google login via Supabase
- Protected Routes:
  - Home, profile, community accessible only after login
  - Login/Signup hidden once logged in
  - Landing page always accessible

### Anime Discovery
- Advanced search and filters (type, status, rating, year, etc.)
- Infinite scroll / load more
- Responsive grid of anime cards with hover effects

### Anime Details
- Full synopsis, genres, release date, episodes
- Horizontal scrolling Characters and Voice Actors section (with images and language)

### User Profile Page
- Shows username, email, account creation date
- Edit profile (update username)
- Delete account and change password

### User Library and Reviews
- Add anime to personal library (watching, completed, dropped, etc.)
- Post reviews, rate anime, and see community reviews

### Community Section
- Browse posts, join discussions, like and comment on reviews

### AI Recommendations (Live)
- Hybrid recommendation engine combining content-based filtering and popularity scoring
- TF-IDF vectorization with 5000 features for semantic similarity
- Cold-start recommendations for new users based on popularity metrics
- Similar anime suggestions on anime details pages using cosine similarity
- Three-tier image fallback system (MyAnimeList CDN  Jikan API  Placeholder)
- Deployed Python Flask API on Render with MongoDB Atlas integration

### Responsive UI
- Built with Tailwind CSS
- Custom utility classes using @layer utilities
- Smooth animations with Framer Motion

---

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- @react-three/fiber (Three.js)
- Framer Motion
- Axios
- Supabase (for Google Auth)

### Backend
- Node.js & Express
- MongoDB Atlas (Mongoose)
- JWT Authentication
- Bcrypt for password hashing
- CORS for cross-origin requests

### AI/ML Stack
- Python 3.12.6
- Flask 3.1.2 (REST API)
- scikit-learn 1.8.0 (TF-IDF, Cosine Similarity)
- pandas 2.3.3 (Data Processing)
- pymongo 4.15.5 (MongoDB Integration)
- gunicorn 23.0.0 (Production Server)

### API
- Jikan API (MyAnimeList unofficial)
- Custom ML API (Flask-based recommendation engine)

---

## AI Recommendation System

### Overview
AniMatch features a production-ready machine learning recommendation engine that provides personalized anime suggestions using hybrid scoring and content-based filtering.

### Architecture

#### 1. Data Pipeline
- **Dataset:** 14,478 anime entries imported from Kaggle dataset
- **User Interactions:** 199+ tracked interactions (ratings, library additions, watch history)
- **Storage:** MongoDB Atlas with two collections:
  - animes: Complete anime metadata (title, genres, synopsis, ratings, popularity)
  - interactions: User behavior tracking (user_id, anime_id, rating, interaction_type)

#### 2. Machine Learning Model

**Content-Based Filtering:**
- TF-IDF Vectorization (5000 features)
- Cosine Similarity for anime-to-anime matching
- Feature Engineering: Combines genres, synopsis, and type

**Hybrid Scoring System:**
`
Recommendation Score = (0.6  Content Similarity) + (0.4  Popularity Score)
`

**Key Components:**
- TfidfVectorizer: Converts text features to numerical vectors
- Cosine Similarity: Measures anime similarity (0-100% match score)
- Collaborative Filtering: Uses user interaction history for personalization
- Cold-Start Strategy: Returns popular anime for new users with no history

#### 3. API Endpoints

Flask REST API (Deployed on Render):
`
GET /api/health                              - System health check
GET /api/recommend/user/<user_id>           - Personalized recommendations
GET /api/recommend/similar/<anime_id>       - Similar anime suggestions
GET /api/recommend/popular                  - Trending/popular anime
`

Response Format:
`json
{
  "recommendations": [
    {
      "anime_id": 1535,
      "title": "Death Note",
      "similarity_score": 0.8547,
      "genres": ["Mystery", "Psychological", "Supernatural"],
      "synopsis": "...",
      "image_url": "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
      "score": 8.63,
      "scored_by": 2234567
    }
  ],
  "count": 12
}
`

#### 4. Features

**Personalized Recommendations**
- Analyzes user watch history and ratings
- Generates 12 tailored anime suggestions
- Updates dynamically as user interacts with content

**Similar Anime Detection**
- Shows related anime on details pages
- Uses cosine similarity on TF-IDF features
- Displays match percentage (e.g., "73.3% match")

**Cold-Start Handling**
- New users receive popular/trending anime
- Sorted by score  scored_by (popularity metric)
- Ensures immediate value without interaction history

**Image Fallback System**
- Primary: MyAnimeList CDN
- Fallback 1: Jikan API (live fetch on error)
- Fallback 2: ui-avatars.com placeholder with anime title

**MongoDB ObjectId Support**
- Handles both string and ObjectId user identifiers
- Seamless integration with Supabase authentication

#### 5. Technical Implementation

**Model Training & Initialization:**
1. Loads anime data from MongoDB Atlas
2. Preprocesses text features (genres + synopsis + type)
3. Fits TF-IDF vectorizer (5000 features, bigrams, stopwords removal)
4. Computes cosine similarity matrix (14,478  14,478)
5. Stores in memory for fast inference

**Performance Metrics:**
- Inference Time: <500ms per request
- Memory Usage: ~2GB (similarity matrix cached)
- API Uptime: 99.9% (Render free tier)
- Cold Start Time: ~15s (auto-initialization on first request)

#### 6. Deployment

**Production Stack:**
- ML API: https://animatch-1.onrender.com (Python Flask + gunicorn)
- Node Backend: https://animatch.onrender.com (Express + MongoDB)
- Frontend: https://animatch-alpha.vercel.app (React + Vite)

**Environment Configuration:**
`
Python API (.env):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Animatch
PORT=5002

Node Backend (.env):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Animatch
JWT_SECRET=your-secret-key
RECOMMENDATION_API_URL=https://animatch-1.onrender.com/api

Frontend (.env):
REACT_APP_API_URL=https://animatch.onrender.com/api
REACT_APP_RECOMMENDATION_API_URL=https://animatch-1.onrender.com/api
`

**Deployment Commands:**
`
# Python API (Render)
gunicorn -w 1 -b 0.0.0.0: api:app --timeout 120

# Node Backend (Render)
npm start

# Frontend (Vercel)
npm run build
`

#### 7. Future Enhancements
- Collaborative filtering with matrix factorization
- Deep learning model (Neural Collaborative Filtering)
- Real-time recommendation updates via WebSockets
- A/B testing framework for algorithm optimization
- User feedback loop (thumbs up/down on recommendations)
- Diversity scoring to avoid filter bubbles
- Seasonal anime trending detection
- Multi-modal recommendations (anime + manga + characters)

---

## Installation Guide

### Backend Setup

`
git clone https://github.com/your-username/animatch.git
cd animatch/backend
npm install
`

Create .env file with the required environment variables, then:

`
npm start
`

Backend will run on http://localhost:5000.

### Frontend Setup

`
cd animatch
npm install
npm start
`

Frontend will run on http://localhost:3000.

### Running the App

1. Open http://localhost:3000 in your browser
2. Register an account, log in, and explore the features

---

## Protected Routes

- Home, Profile, Library require valid JWT
- Login and Signup redirect to Home if already logged in
- Landing page is always open

---

## Key Features Implementation

### 3D Anime Cube
Built using @react-three/fiber.

### Account Creation Date
Shown in profile page (stored in createdAt field of user model).

---

## Roadmap

- [x] AI-based recommendations (Completed and Live!)
- [ ] Review commenting and reactions
- [ ] Dark mode toggle
- [x] Deployment (Vercel for frontend, Render for backend)
- [ ] Matrix factorization for collaborative filtering
- [ ] Neural collaborative filtering (deep learning)
- [ ] Real-time recommendation updates

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## License

This project is licensed under the MIT License.
