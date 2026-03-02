import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
    uploadBook,
    getBooks,
    getBookById,
    deleteBook,
    getBookChunks,
} from "../controllers/bookController.js";

const router = Router();

// All book routes require authentication
router.use(authenticate);

router.post("/upload", upload.single("file"), uploadBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.delete("/:id", deleteBook);
router.get("/:id/chunks", getBookChunks);

export default router;
