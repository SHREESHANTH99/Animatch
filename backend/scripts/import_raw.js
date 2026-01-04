import { MongoClient } from "mongodb";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

async function importFromCSV(filePath) {
  const animeData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const animeId = parseInt(row.anime_id);
          if (!animeId || isNaN(animeId)) return;

          const anime = {
            anime_id: animeId,
            title: row.title || "",
            title_english: row.title_english || "",
            genres: row.genre || "",
            themes: row.Themes || "",
            synopsis: row.synopsis || row.background || "",
            popularity_score: parseFloat(row.score) * 10 || 50,
            image_url: row.image_url || "",
            rating: row.rating || "",
            score: parseFloat(row.score) || null,
            episodes: parseInt(row.episodes) || null,
            status: row.status || "",
            type: row.type || "",
            aired: row.aired_string || "",
            members: parseInt(row.members) || null,
            favorites: parseInt(row.favorites) || null,
            rank: parseInt(row.rank) || null,
          };

          if (anime.anime_id && anime.title) {
            animeData.push(anime);
          }
        } catch (err) {
          // Skip bad rows
        }
      })
      .on("end", () => resolve(animeData))
      .on("error", reject);
  });
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("📖 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected!");

    const db = client.db();
    console.log("📁 Database:", db.databaseName);

    const collection = db.collection("animes");

    // Read CSV
    const csvPath = path.join(
      __dirname,
      "../recommendation_system/data/AnimeList.csv"
    );
    console.log("\n📖 Reading CSV file...");
    const animeData = await importFromCSV(csvPath);
    console.log(`✅ Parsed ${animeData.length} anime`);

    if (animeData.length === 0) {
      console.log("❌ No data to import");
      return;
    }

    // Clear existing
    console.log("\n🗑️  Clearing existing data...");
    await collection.deleteMany({});

    // Insert in batches
    console.log("\n📥 Inserting data...");
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < animeData.length; i += batchSize) {
      const batch = animeData.slice(i, i + batchSize);
      const result = await collection.insertMany(batch, { ordered: false });
      inserted += result.insertedCount;
      console.log(`   Inserted ${inserted}/${animeData.length}...`);
    }

    // Verify
    const finalCount = await collection.countDocuments();
    console.log(`\n✅ Import complete! Total: ${finalCount}`);

    // Show samples
    const samples = await collection.find().limit(5).toArray();
    console.log("\n📺 Sample anime:");
    samples.forEach((a) => console.log(`   - ${a.title} (ID: ${a.anime_id})`));
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Connection closed");
  }
}

main();
