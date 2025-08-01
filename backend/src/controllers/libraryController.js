import { LibraryItem } from "../models/libraryItem.model.js";

export const addLibraryItem = async (req, res) => {
  try {
    const { animeId, title, imageUrl, status, scores, year } = req.body;
    if (!animeId || !title || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const userId = req.user.id;
    const existingItem = await LibraryItem.findOne({
      userId: userId,
      animeId: animeId,
    });
    if (existingItem) {
      return res.status(409).json({
        error: "This anime already exists in your  library",
        existingItem: existingItem,
        message: `${title} is already in your ${existingItem.status} list`,
      });
    }
    const newItem = new LibraryItem({
      userId,
      animeId,
      scores,
      title,
      year,
      imageUrl,
      status: status || "watching",
      created_at: new Date(),
      updated_at: new Date(),
    });
    const savedItem = await newItem.save();
    console.log("Saved item with updated_at:", savedItem.updated_at); // Debug log
    res.status(201).json(savedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};

export const getUserLibrary = async (req, res) => {
  try {
    const items = await LibraryItem.find({ userId: req.user.id }).sort({
      updated_at: -1,
    });
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};
export const updateLibraryItem = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    const updatedItem = await LibraryItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedItem) {
      res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};

export const deleteLibraryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await LibraryItem.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!deletedItem) {
      res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};
