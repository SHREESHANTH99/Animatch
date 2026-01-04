import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI.includes("?") && !MONGODB_URI.endsWith("/animatch")) {
  MONGODB_URI = MONGODB_URI.trim() + "/animatch";
}

console.log("Testing direct insert...");

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected");

    const db = mongoose.connection.db;
    const collection = db.collection("animes");

    // Try a direct insert
    const testDoc = {
      anime_id: 999999,
      title: "Test Anime",
      genres: "Action",
      synopsis: "This is a test",
      popularity_score: 50,
    };

    console.log("Inserting test document...");
    const result = await collection.insertOne(testDoc);
    console.log("Insert result:", result);

    // Check if it's there
    const count = await collection.countDocuments();
    console.log("Total documents:", count);

    const found = await collection.findOne({ anime_id: 999999 });
    console.log("Found test doc:", found ? "YES" : "NO");

    // Clean up
    await collection.deleteOne({ anime_id: 999999 });

    mongoose.connection.close();
  })
  .catch((err) => console.error("Error:", err));
