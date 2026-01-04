import mongoose from "mongoose";
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
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define schemas
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema, "users");

const animeSchema = new mongoose.Schema({}, { strict: false });
const Anime = mongoose.model("Anime", animeSchema, "animes");

const interactionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    anime_id: { type: Number, required: true },
    interaction_type: {
      type: String,
      enum: ["view", "like", "favorite", "watch", "plan_to_watch", "completed"],
      required: true,
    },
    rating: { type: Number, min: 1, max: 10 },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "interactions" }
);

const Interaction = mongoose.model("Interaction", interactionSchema);

async function createSampleInteractions() {
  try {
    console.log("🔍 Checking existing data...");

    // Get users
    const users = await User.find().limit(10);
    console.log(`   Found ${users.length} users`);

    if (users.length === 0) {
      console.log("⚠️  No users found. Please create some users first.");
      return;
    }

    // Get anime
    const animeList = await Anime.find().limit(500);
    console.log(`   Found ${animeList.length} anime`);

    if (animeList.length === 0) {
      console.log("❌ No anime found. Please import anime data first.");
      return;
    }

    // Clear existing interactions
    console.log("\n🗑️  Clearing existing interactions...");
    await Interaction.deleteMany({});

    // Create sample interactions
    console.log("\n📝 Creating sample interactions...");
    const interactions = [];
    const interactionTypes = [
      "view",
      "like",
      "favorite",
      "completed",
      "plan_to_watch",
    ];

    for (const user of users) {
      // Each user interacts with 10-30 random anime
      const numInteractions = Math.floor(Math.random() * 20) + 10;
      const shuffled = [...animeList].sort(() => 0.5 - Math.random());
      const selectedAnime = shuffled.slice(0, numInteractions);

      for (const anime of selectedAnime) {
        const interactionType =
          interactionTypes[Math.floor(Math.random() * interactionTypes.length)];

        interactions.push({
          user_id: user._id.toString(),
          anime_id: anime.anime_id,
          interaction_type: interactionType,
          rating:
            interactionType === "completed" || interactionType === "favorite"
              ? Math.floor(Math.random() * 4) + 7 // Rating 7-10 for completed/favorites
              : Math.floor(Math.random() * 10) + 1, // Rating 1-10 for others
          timestamp: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random date within last 30 days
        });
      }
    }

    console.log(`   Generated ${interactions.length} interactions`);

    // Insert interactions
    console.log("\n📥 Inserting interactions...");
    await Interaction.insertMany(interactions);

    console.log(`\n✅ Created ${interactions.length} sample interactions!`);

    // Show statistics
    const stats = await Interaction.aggregate([
      {
        $group: {
          _id: "$interaction_type",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("\n📊 Interaction statistics:");
    stats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
  } catch (error) {
    console.error("❌ Error creating interactions:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// Run the script
createSampleInteractions();
