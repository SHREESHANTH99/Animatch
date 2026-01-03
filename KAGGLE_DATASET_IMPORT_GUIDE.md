# 📊 Importing Kaggle Anime Dataset - Complete Guide

## What You Have

✅ Anime dataset from Kaggle (CSV/JSON file)

## What You Need

1. Import anime data into MongoDB
2. Create interactions collection
3. Initialize recommendation system
4. Test with real data

---

## Step 1: Prepare Your Kaggle Dataset

### Expected Kaggle Columns (Common)

Most Kaggle anime datasets have these columns:

- `anime_id` or `MAL_ID`
- `Name` or `title`
- `Genres`
- `Synopsis` or `description`
- `Score` or `rating`
- `Members` or `popularity`

### Required Mapping

Map Kaggle columns to our schema:

```javascript
{
  anime_id: Number,           // Kaggle: anime_id or MAL_ID
  title: String,              // Kaggle: Name or title
  genres: String,             // Kaggle: Genres (comma-separated)
  themes: String,             // Kaggle: Themes (or extract from genres)
  synopsis: String,           // Kaggle: Synopsis or description
  popularity_score: Number,   // Kaggle: Score * 10 or Members/10000
  image_url: String           // Kaggle: Image URL or use placeholder
}
```

---

## Step 2: Create Import Script

Create this file: `backend/scripts/import_anime_data.js`

```javascript
import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define Anime Schema
const animeSchema = new mongoose.Schema({
  anime_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genres: { type: String, default: "" },
  themes: { type: String, default: "" },
  synopsis: { type: String, default: "" },
  popularity_score: { type: Number, default: 50 },
  image_url: { type: String, default: "" },
  rating: { type: Number },
  episodes: { type: Number },
  status: { type: String },
  type: { type: String },
});

const Anime = mongoose.model("Anime", animeSchema);

async function importFromCSV(filePath) {
  const animeData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Map Kaggle columns to our schema
        const anime = {
          anime_id: parseInt(row.anime_id || row.MAL_ID || row.id),
          title: row.Name || row.title || row.name,
          genres: row.Genres || row.genres || "",
          themes: row.Themes || extractThemes(row.Genres) || "",
          synopsis: row.Synopsis || row.synopsis || row.description || "",
          popularity_score: calculatePopularity(row),
          image_url: row.Image || row.image_url || "",
          rating: parseFloat(row.Score || row.rating || 0),
          episodes: parseInt(row.Episodes || row.episodes || 0),
          status: row.Status || row.status || "",
          type: row.Type || row.type || "",
        };

        // Only add if we have valid data
        if (anime.anime_id && anime.title) {
          animeData.push(anime);
        }
      })
      .on("end", () => {
        resolve(animeData);
      })
      .on("error", reject);
  });
}

function extractThemes(genres) {
  // Extract themes from genres if themes column doesn't exist
  const themeKeywords = [
    "School",
    "Magic",
    "Ninja",
    "Samurai",
    "Military",
    "Space",
    "Historical",
  ];
  const genreList = genres ? genres.split(",").map((g) => g.trim()) : [];
  return genreList
    .filter((g) => themeKeywords.some((t) => g.includes(t)))
    .join(", ");
}

function calculatePopularity(row) {
  // Calculate popularity score (0-100)
  if (row.Score) {
    return parseFloat(row.Score) * 10; // If score is 0-10, convert to 0-100
  } else if (row.Members) {
    return Math.min(100, parseInt(row.Members) / 10000); // Scale members
  }
  return 50; // Default
}

async function importData(csvFilePath) {
  try {
    console.log("📖 Reading CSV file...");
    const animeData = await importFromCSV(csvFilePath);

    console.log(`✅ Parsed ${animeData.length} anime from CSV`);

    // Clear existing data (optional - comment out if you want to keep existing)
    console.log("🗑️  Clearing existing anime data...");
    await Anime.deleteMany({});

    // Insert in batches
    console.log("💾 Importing to MongoDB...");
    const batchSize = 100;
    for (let i = 0; i < animeData.length; i += batchSize) {
      const batch = animeData.slice(i, i + batchSize);
      await Anime.insertMany(batch, { ordered: false });
      console.log(
        `   Imported ${Math.min(i + batchSize, animeData.length)}/${
          animeData.length
        }`
      );
    }

    console.log("✅ Import complete!");
    console.log(`📊 Total anime in database: ${await Anime.countDocuments()}`);

    // Show sample
    const sample = await Anime.findOne();
    console.log("\n📺 Sample anime:");
    console.log(JSON.stringify(sample, null, 2));

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Import failed:", error);
    mongoose.disconnect();
  }
}

// Usage
const csvFilePath = process.argv[2] || "./anime_dataset.csv";
importData(csvFilePath);
```

---

## Step 3: Install Required Package

```powershell
cd backend
npm install csv-parser
```

---

## Step 4: Run Import Script

```powershell
# Place your Kaggle CSV in backend folder
cd backend
node scripts/import_anime_data.js ../anime_dataset.csv
```

---

## Step 5: Create Sample Interactions

Create: `backend/scripts/create_sample_interactions.js`

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const interactionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  anime_id: { type: Number, required: true },
  interaction_type: {
    type: String,
    enum: ["favorite", "like", "view"],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const Interaction = mongoose.model("Interaction", interactionSchema);

async function createSampleInteractions() {
  try {
    // Get some anime IDs from database
    const Anime = mongoose.model("Anime");
    const animeList = await Anime.find().limit(50).select("anime_id");
    const animeIds = animeList.map((a) => a.anime_id);

    console.log(`Found ${animeIds.length} anime to create interactions from`);

    // Create sample interactions for testing
    const interactions = [];

    // Create interactions for 5 test users
    for (let userId = 1; userId <= 5; userId++) {
      // Each user interacts with 5-10 random anime
      const numInteractions = Math.floor(Math.random() * 6) + 5;

      for (let i = 0; i < numInteractions; i++) {
        const randomAnime =
          animeIds[Math.floor(Math.random() * animeIds.length)];
        const types = ["favorite", "like", "view"];
        const randomType = types[Math.floor(Math.random() * types.length)];

        interactions.push({
          user_id: `test_user_${userId}`,
          anime_id: randomAnime,
          interaction_type: randomType,
          timestamp: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random within last 30 days
        });
      }
    }

    // Clear existing
    await Interaction.deleteMany({});

    // Insert
    await Interaction.insertMany(interactions);

    console.log(`✅ Created ${interactions.length} sample interactions`);

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.disconnect();
  }
}

createSampleInteractions();
```

Run it:

```powershell
node scripts/create_sample_interactions.js
```

---

## Step 6: Test Recommendation System

```powershell
# Terminal 1: Start Flask API
cd backend\recommendation_system
python api.py --mode server --port 5002

# Terminal 2: Test with MongoDB data
# The API will automatically load from your MongoDB
```

---

## Step 7: Create MongoDB Integration Script

Create: `backend/recommendation_system/load_from_mongodb.py`

```python
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

    print(f"✅ Loaded {len(anime_df)} anime")

    # Load interactions
    print("💫 Loading interactions...")
    interaction_collection = db['interactions']
    interactions_cursor = interaction_collection.find()
    interactions_df = pd.DataFrame(list(interactions_cursor))

    if '_id' in interactions_df.columns:
        interactions_df = interactions_df.drop('_id', axis=1)

    print(f"✅ Loaded {len(interactions_df)} interactions")

    client.close()

    return anime_df, interactions_df

if __name__ == "__main__":
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/animatch')
    anime_df, interactions_df = load_anime_from_mongodb(mongodb_uri)

    print("\n📊 Anime DataFrame:")
    print(anime_df.head())
    print(f"\nColumns: {anime_df.columns.tolist()}")

    print("\n💫 Interactions DataFrame:")
    print(interactions_df.head())
```

Test it:

```powershell
pip install pymongo
python load_from_mongodb.py
```

---

## Step 8: Update API to Use MongoDB

Update `backend/recommendation_system/api.py` around line 300-350 to load from MongoDB:

```python
def load_data_from_mongodb():
    """Load data from MongoDB."""
    from load_from_mongodb import load_anime_from_mongodb

    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/animatch')
    anime_df, interactions_df = load_anime_from_mongodb(mongodb_uri)

    return anime_df, interactions_df
```

---

## Quick Setup Summary

```powershell
# 1. Install dependencies
cd backend
npm install csv-parser
pip install pymongo

# 2. Import your Kaggle dataset
node scripts/import_anime_data.js path/to/your/kaggle_anime.csv

# 3. Create sample interactions
node scripts/create_sample_interactions.js

# 4. Start recommendation system
cd recommendation_system
python api.py --mode server --port 5002

# 5. Start backend
cd ..
npm start

# 6. Start frontend
cd ..
npm start
```

---

## Verify Everything Works

Visit: `http://localhost:3000/ai-recommendations`

You should see:

- ✅ Real anime from your Kaggle dataset
- ✅ Personalized recommendations
- ✅ Match percentages
- ✅ Recommendation reasons

---

## Common Kaggle Datasets

1. **MyAnimeList Dataset**
   - Columns: anime_id, name, genre, type, episodes, rating, members
2. **Anime Recommendations Database**

   - Columns: anime_id, name, genre, type, episodes, rating, members

3. **Jikan API Dataset**
   - Columns: mal_id, title, genres, synopsis, score, members

Map these to our schema using the import script above!

---

## Troubleshooting

### Issue: Column names don't match

**Solution:** Update the mapping in `import_anime_data.js`:

```javascript
anime_id: parseInt(row.YOUR_ID_COLUMN),
title: row.YOUR_TITLE_COLUMN,
```

### Issue: No interactions data

**Solution:** Use the sample interactions script to create test data

### Issue: Genres format is different

**Solution:** Adjust the parsing in the import script

---

🎉 **You're all set!** Your Kaggle dataset is now powering the AI recommendation system!
