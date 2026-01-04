import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Check animes collection
    const animeCount = await db.collection("animes").countDocuments();
    console.log(`📺 Anime Collection: ${animeCount} documents`);

    if (animeCount > 0) {
      const sampleAnime = await db.collection("animes").findOne();
      console.log(
        `   Sample: ${sampleAnime.title} (ID: ${sampleAnime.anime_id})`
      );
    }

    // Check users collection
    const userCount = await db.collection("users").countDocuments();
    console.log(`\n👤 Users Collection: ${userCount} documents`);

    // Check interactions collection
    const interactionCount = await db
      .collection("interactions")
      .countDocuments();
    console.log(`\n💫 Interactions Collection: ${interactionCount} documents`);

    if (interactionCount > 0) {
      const interactionStats = await db
        .collection("interactions")
        .aggregate([
          {
            $group: {
              _id: "$interaction_type",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      console.log("   Breakdown:");
      interactionStats.forEach((stat) => {
        console.log(`     - ${stat._id}: ${stat.count}`);
      });
    }

    console.log("\n" + "=".repeat(50));

    if (animeCount === 0) {
      console.log(
        "⚠️  No anime data found. Run: node scripts/import_anime_data.js"
      );
    } else if (interactionCount === 0) {
      console.log(
        "⚠️  No interactions found. Run: node scripts/create_interactions.js"
      );
    } else {
      console.log(
        "✅ All data is ready! You can now use the recommendation system."
      );
    }

    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  });
