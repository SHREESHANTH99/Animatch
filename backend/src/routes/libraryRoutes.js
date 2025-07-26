import express from "express";
import { addLibraryItem,deleteLibraryItem,updateLibraryItem,getUserLibrary } from "../controllers/libraryController.js";
// import { verifyToken } from "../middleware/authMiddlesware.js";
import { verifyToken } from "../middleware/auth.js";
const router=express.Router();


router.post("/",verifyToken,addLibraryItem)
router.get("/",verifyToken,getUserLibrary)
router.patch("/:id",verifyToken,updateLibraryItem)
router.delete("/:id",verifyToken,deleteLibraryItem)

export default router;