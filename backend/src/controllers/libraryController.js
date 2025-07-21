import { LibraryItem } from "../models/libraryItem.model.js";

export const addLibraryItem = async (req, res) => {
  try {
    const { animeId, title, imageUrl, status } = req.body;
    if (!animeId || !title || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newItem = new LibraryItem({
      userId: req.user.id,
      animeId,
      title,
      imageUrl,
      status: status || "watching",
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};

export const getUserLibrary = async (req, res) => {
  try {
    const items = await LibraryItem.find({ userId: req.user.id }).sort({
      updatedAt: -1,
    });
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error:", error: err.message });
  }
};
export const updateLibraryItem = async (req, res) => {
  try {
    const updatedItem = await LibraryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
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
