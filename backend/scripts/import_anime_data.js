import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔗 MongoDB URI:", process.env.MONGODB_URI ? "Found" : "Not found");

// Connect to MongoDB
let MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/Animatch";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log("📁 Database:", mongoose.connection.name);
    console.log("📁 Collection:", "animes");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Anime Schema
const animeSchema = new mongoose.Schema(
  {
    anime_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    title_english: { type: String },
    genres: { type: String, default: "" },
    themes: { type: String, default: "" },
    synopsis: { type: String, default: "" },
    popularity_score: { type: Number, default: 50 },
    image_url: { type: String, default: "" },
    rating: { type: Number },
    score: { type: Number },
    episodes: { type: Number },
    status: { type: String },
    type: { type: String },
    aired: { type: String },
    members: { type: Number },
    favorites: { type: Number },
    rank: { type: Number },
  },
  { collection: "animes" }
);

const Anime = mongoose.model("Anime", animeSchema);

async function importFromCSV(filePath) {
  const animeData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          // Parse anime_id
          const animeId = parseInt(row.anime_id || row.MAL_ID || row.id);
          if (!animeId || isNaN(animeId)) return;

          // Map Kaggle columns to our schema
          const anime = {
            anime_id: animeId,
            title: row.title || row.Name || row.name || "",
            title_english: row.title_english || "",
            genres: row.genre || row.Genres || row.genres || "",
            themes: row.Themes || "",
            synopsis:
              row.synopsis ||
              row.Synopsis ||
              row.description ||
              row.background ||
              "",
            popularity_score: calculatePopularity(row),
            image_url: row.image_url || row.Image || "",
            rating: row.rating || "",
            score: parseFloat(row.score || row.Score || 0) || null,
            episodes: parseInt(row.episodes || row.Episodes || 0) || null,
            status: row.status || row.Status || "",
            type: row.type || row.Type || "",
            aired: row.aired_string || row.aired || "",
            members: parseInt(row.members || row.Members || 0) || null,
            favorites: parseInt(row.favorites || row.Favorites || 0) || null,
            rank: parseInt(row.rank || row.Rank || 0) || null,
          };

          // Only add if we have valid data
          if (anime.anime_id && anime.title) {
            animeData.push(anime);
          }
        } catch (err) {
          console.error("Error parsing row:", err.message);
        }
      })
      .on("end", () => {
        resolve(animeData);
      })
      .on("error", reject);
  });
}

function calculatePopularity(row) {
  // Calculate popularity score (0-100)
  if (row.score || row.Score) {
    const score = parseFloat(row.score || row.Score);
    if (!isNaN(score)) return score * 10; // If score is 0-10, convert to 0-100
  }
  if (row.members || row.Members) {
    const members = parseInt(row.members || row.Members);
    if (!isNaN(members)) return Math.min(100, members / 10000); // Scale members
  }
  return 50; // Default
}

async function importData(csvFilePath) {
  try {
    console.log("📖 Reading CSV file:", csvFilePath);

    if (!fs.existsSync(csvFilePath)) {
      console.error("❌ CSV file not found:", csvFilePath);
      return;
    }

    const animeData = await importFromCSV(csvFilePath);
    console.log(`✅ Parsed ${animeData.length} anime from CSV`);

    if (animeData.length === 0) {
      console.error("❌ No data parsed from CSV");
      return;
    }

    // Clear existing data (optional - comment out if you want to keep existing)
    console.log("🗑️  Clearing existing anime data...");
    await Anime.deleteMany({});

    // Insert in batches to avoid memory issues
    console.log("📥 Inserting anime data...");
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < animeData.length; i += batchSize) {
      const batch = animeData.slice(i, i + batchSize);
      try {
        const result = await Anime.insertMany(batch, { ordered: false });
        inserted += result.length;
        if (i === 0) {
          // Log first batch details
          console.log(
            `   First anime being inserted:`,
            JSON.stringify(batch[0], null, 2)
          );
        }
        console.log(
          `   Inserted ${inserted}/${animeData.length} anime (batch returned ${result.length} docs)...`
        );
      } catch (err) {
        console.error(
          `   ❌ Error in batch ${i}-${i + batchSize}:`,
          err.message
        );
        if (err.writeErrors) {
          console.error(`   Write errors: ${err.writeErrors.length}`);
          console.error(`   First error:`, err.writeErrors[0]);
        }
        // Some duplicates might exist, that's okay
        if (err.code === 11000) {
          console.log(`   Batch had some duplicates, continuing...`);
          // Count successful inserts from error
          if (err.insertedDocs) {
            inserted += err.insertedDocs.length;
          }
        }
      }
    }

    // Wait a moment for writes to be acknowledged
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(
      `\n✅ Import complete! Total anime in database: ${await Anime.countDocuments()}`
    );

    // Show some samples
    const samples = await Anime.find().limit(5);
    console.log("\n📺 Sample anime:");
    samples.forEach((anime) => {
      console.log(
        `   - ${anime.title} (ID: ${anime.anime_id}, Score: ${anime.score})`
      );
    });
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the import
const csvPath = path.join(
  __dirname,
  "../recommendation_system/data/AnimeList.csv"
);
importData(csvPath);
