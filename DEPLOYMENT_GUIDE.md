# 🚀 Production Deployment Guide - AI Recommendation System

You already have:

- ✅ Backend (Node.js) on Render
- ✅ Frontend (React) on Vercel

Now add:

- 🐍 Python Flask API (Recommendation System)

---

## Architecture Overview

```
Vercel (Frontend)
    ↓ API calls
Render (Node.js Backend)
    ↓ HTTP requests
Render/Railway (Python Flask API)
    ↓ reads from
MongoDB Atlas
```

---

## Option 1: Deploy Python Flask to Render (Recommended)

### Step 1: Prepare Flask API for Production

Create `backend/recommendation_system/requirements.txt` (should already exist):

```txt
flask>=2.3.0
flask-cors>=4.0.0
scikit-learn>=1.3.0
numpy>=1.24.0
pandas>=2.0.0
scipy>=1.11.0
pymongo>=4.5.0
gunicorn>=21.2.0
```

Create `backend/recommendation_system/Procfile`:

```
web: gunicorn -w 4 -b 0.0.0.0:$PORT api:app --timeout 120
```

Create `backend/recommendation_system/runtime.txt`:

```
python-3.11.0
```

Update `backend/recommendation_system/api.py` - Change the bottom section:

```python
if __name__ == '__main__':
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))

    # Check if we should initialize with sample data
    if '--mode' in sys.argv and 'server' in sys.argv:
        print(f"🚀 Starting recommendation API server on port {port}...")
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        # Production mode - let gunicorn handle it
        print("🚀 Running in production mode with Gunicorn")
```

### Step 2: Create New Render Web Service for Flask

1. **Go to Render Dashboard** → https://dashboard.render.com/

2. **Click "New +" → "Web Service"**

3. **Connect Your GitHub Repository**

4. **Configure Service:**

   - **Name:** `animatch-recommendation-api`
   - **Environment:** `Python 3`
   - **Region:** Same as your backend (for lower latency)
   - **Branch:** `main` or your deployment branch
   - **Root Directory:** `animatch/backend/recommendation_system`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT api:app --timeout 120`

5. **Environment Variables:**

   ```
   MONGODB_URI=mongodb+srv://Shreeshanth99:Shre%40123@animatch.df0o23d.mongodb.net
   FLASK_ENV=production
   PORT=10000
   ```

6. **Instance Type:** Free or Starter (depending on your needs)

7. **Click "Create Web Service"**

8. **Wait for deployment** (5-10 minutes)

9. **Copy the URL** - Will be like: `https://animatch-recommendation-api.onrender.com`

### Step 3: Update Your Backend Environment Variables

Go to your **Node.js Backend on Render**:

1. Go to Environment Variables
2. Update or add:
   ```
   PYTHON_API_URL=https://animatch-recommendation-api.onrender.com/api/recommend
   ```
3. Click "Save Changes"
4. Render will automatically redeploy your backend

### Step 4: Update Frontend (Vercel)

Your frontend doesn't need changes if it's calling your backend API correctly. But verify in `src/utils/api.js`:

```javascript
// Should point to your Render backend
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://your-backend.onrender.com";
```

Set environment variable in Vercel:

```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Step 5: Test Deployment

```bash
# Test Flask API health
curl https://animatch-recommendation-api.onrender.com/api/recommend/health

# Test through backend
curl https://your-backend.onrender.com/api/recommendations/health

# Test from frontend
# Visit: https://your-app.vercel.app/ai-recommendations
```

---

## Option 2: Deploy Python Flask to Railway (Alternative)

### Step 1: Prepare Files (Same as Above)

### Step 2: Deploy to Railway

1. **Go to Railway** → https://railway.app/

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select Your Repository**

4. **Configure:**

   - **Root Directory:** `animatch/backend/recommendation_system`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT api:app --timeout 120`

5. **Add Environment Variables:**

   ```
   MONGODB_URI=your_mongodb_connection_string
   FLASK_ENV=production
   ```

6. **Generate Domain** - Railway will give you a URL

7. **Update Backend .env** with the Railway URL

---

## Option 3: Deploy Both Services on Same Render Instance (Budget Option)

### Modify backend/server.js to start Flask as subprocess:

```javascript
import { spawn } from "child_process";

// Start Python Flask API as subprocess
const pythonProcess = spawn(
  "python",
  ["recommendation_system/api.py", "--mode", "server", "--port", "5002"],
  {
    cwd: __dirname,
  }
);

pythonProcess.stdout.on("data", (data) => {
  console.log(`Flask: ${data}`);
});

pythonProcess.stderr.on("data", (data) => {
  console.error(`Flask Error: ${data}`);
});
```

Update `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "postinstall": "cd recommendation_system && pip install -r requirements.txt"
  }
}
```

**Not recommended** - but works if you need to save costs.

---

## Production Checklist

### ✅ Pre-Deployment

- [ ] Import anime data to MongoDB Atlas
- [ ] Create interactions collection
- [ ] Test recommendation system locally
- [ ] Update all environment variables
- [ ] Remove debug mode from Flask API

### ✅ Flask API Deployment

- [ ] `requirements.txt` created
- [ ] `Procfile` created
- [ ] `gunicorn` installed
- [ ] MongoDB connection tested
- [ ] Health endpoint working
- [ ] CORS configured for your domain

### ✅ Backend Update

- [ ] `PYTHON_API_URL` environment variable set
- [ ] Recommendation routes working
- [ ] Error handling tested
- [ ] Timeout configured

### ✅ Frontend Update

- [ ] API base URL pointing to production backend
- [ ] Environment variables set in Vercel
- [ ] CORS headers working
- [ ] Test AI Recommendations page

### ✅ Post-Deployment Testing

- [ ] Health check passes
- [ ] Can get recommendations
- [ ] Similar anime works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] No console errors

---

## Environment Variables Summary

### Python Flask API (Render/Railway)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
FLASK_ENV=production
PORT=10000
```

### Node.js Backend (Render)

```env
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
JWT_SECRET=your_jwt_secret
PYTHON_API_URL=https://animatch-recommendation-api.onrender.com/api/recommend
CORS_ORIGIN=https://your-app.vercel.app
```

### React Frontend (Vercel)

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## Performance Optimization

### 1. Enable Caching

Update Flask API to cache results:

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_recommendations(user_id, top_n):
    # Your recommendation logic
    pass
```

### 2. Use Redis for Caching (Optional)

Add Redis on Render:

- Render Dashboard → Add Redis
- Update Flask to use Redis for caching

### 3. Optimize MongoDB Queries

Create indexes:

```javascript
db.animes.createIndex({ anime_id: 1 });
db.animes.createIndex({ genres: "text", synopsis: "text" });
db.interactions.createIndex({ user_id: 1, anime_id: 1 });
```

### 4. Precompute Similarity Matrix

Run this once after importing data:

```python
# Store similarity matrix in MongoDB or file storage
recommender.model.precompute_similarity()
```

---

## Monitoring & Maintenance

### 1. Monitor Logs

- **Render:** Dashboard → Your Service → Logs
- **Railway:** Dashboard → Deployments → Logs

### 2. Set Up Health Checks

Render automatically checks `/` endpoint. Add:

```python
@app.route('/')
def health():
    return jsonify({"status": "healthy", "service": "recommendation-api"})
```

### 3. Monitor Performance

Add logging:

```python
import time

@app.route('/api/recommend/user/<user_id>')
def recommend_user(user_id):
    start = time.time()
    # ... your logic
    duration = time.time() - start
    app.logger.info(f"Recommendation for {user_id} took {duration:.2f}s")
    return response
```

---

## Troubleshooting Deployment

### Issue: "ModuleNotFoundError" in Flask

**Solution:** Add missing package to `requirements.txt`

### Issue: Timeout errors

**Solution:** Increase timeout in Gunicorn:

```
web: gunicorn -w 4 -b 0.0.0.0:$PORT api:app --timeout 300
```

### Issue: Out of memory

**Solution:**

- Use Render Starter plan instead of Free
- Reduce TF-IDF max_features
- Use sparse matrices

### Issue: Cold start delays

**Solution:**

- Use Render paid plan (keeps service warm)
- Implement lazy loading
- Use background jobs to keep warm

### Issue: CORS errors

**Solution:** Update Flask CORS:

```python
CORS(app, origins=[
    'https://your-app.vercel.app',
    'http://localhost:3000'
])
```

---

## Cost Estimation

### Free Tier (Good for Testing)

- **Render Free:** Flask API (sleeps after 15 min inactivity)
- **Render Free:** Node.js Backend (750 hours/month)
- **Vercel Free:** Frontend (unlimited)
- **MongoDB Atlas Free:** 512MB storage
- **Total:** $0/month

### Production (Recommended)

- **Render Starter:** Flask API (~$7/month)
- **Render Starter:** Node.js Backend (~$7/month)
- **Vercel Pro:** Frontend ($20/month)
- **MongoDB Atlas:** M10 (~$57/month)
- **Total:** ~$91/month

### Budget Option

- Combine Flask + Node.js on one Render instance
- Use Vercel Free
- Use MongoDB Free tier
- **Total:** $0-7/month

---

## Quick Deployment Commands

```bash
# 1. Create production files
cd backend/recommendation_system
echo "gunicorn>=21.2.0" >> requirements.txt
echo "web: gunicorn -w 4 -b 0.0.0.0:\$PORT api:app --timeout 120" > Procfile

# 2. Commit changes
git add .
git commit -m "Add recommendation system deployment config"
git push origin main

# 3. Deploy to Render
# (Use Render dashboard to create new web service)

# 4. Update backend environment variable
# PYTHON_API_URL=https://your-flask-api.onrender.com/api/recommend

# 5. Test
curl https://your-flask-api.onrender.com/api/recommend/health
```

---

## 🎉 Deployment Complete!

After deployment, your users can:

1. Visit your Vercel app
2. Click "AI Picks" in navbar
3. Get personalized recommendations
4. See similar anime on detail pages

All powered by production ML infrastructure! 🚀

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Flask Deployment:** https://flask.palletsprojects.com/en/latest/deploying/

Need help? Check logs first, then review error messages in browser console!
