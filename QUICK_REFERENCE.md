# 🚀 Quick Reference Card - AI Recommendations

## Start Services (3 Commands)

```powershell
# Terminal 1: Flask API
cd backend\recommendation_system
python api.py --mode server --port 5000

# Terminal 2: Node.js
cd backend
npm start

# Terminal 3: React
npm start
```

## Test Endpoints

```powershell
# Health Check
curl http://localhost:5000/api/recommend/health

# Get Recommendations
curl http://localhost:5001/api/recommendations/user/123

# Get Similar Anime
curl http://localhost:5001/api/recommendations/similar/1
```

## User Flow

1. Login → 2. Click "AI Picks" → 3. View Recommendations → 4. Click Anime → 5. See Similar Anime

## File Locations

| Component  | Location                                                |
| ---------- | ------------------------------------------------------- |
| Main Page  | `src/pages/AIRecommendations.jsx`                       |
| Card       | `src/components/Recommendations/RecommendationCard.jsx` |
| Similar    | `src/components/Recommendations/SimilarAnime.jsx`       |
| API Routes | `backend/src/routes/recommendationRoutes.js`            |
| Flask API  | `backend/recommendation_system/api.py`                  |

## Quick Fixes

### Service Unavailable

```powershell
cd backend\recommendation_system
python api.py --mode server --port 5000
```

### No Recommendations

- User needs watch history
- Check interactions in MongoDB
- Run: `POST /api/recommendations/initialize`

### Dependencies Missing

```powershell
# Python
pip install -r backend/recommendation_system/requirements.txt

# Node.js
cd backend
npm install axios
```

## URLs

- Frontend: http://localhost:3000
- AI Page: http://localhost:3000/ai-recommendations
- Backend: http://localhost:5001
- Flask API: http://localhost:5000

## Algorithm Summary

- **Method:** TF-IDF + Cosine Similarity
- **Weights:** Genres 3x, Themes 2x, Synopsis 1x
- **Scoring:** 60% Content + 40% Popularity
- **Response Time:** ~200-500ms

## Support Checklist

- [ ] All 3 services running?
- [ ] MongoDB connected?
- [ ] Health check passes?
- [ ] Browser console clear?
- [ ] User logged in?

---

**Pro Tip:** Use the automated script: `.\start-recommendation-system.ps1`
