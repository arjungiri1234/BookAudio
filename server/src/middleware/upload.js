import multer from "multer";
import path from "path";

const ALLOWED_TYPES = ["application/pdf", "application/epub+zip", "text/plain"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".pdf", ".epub", ".txt"];

    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${ext}. Only PDF, EPUB, and TXT files are allowed.`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE },
});
