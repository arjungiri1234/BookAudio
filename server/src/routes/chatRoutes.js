import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { queryChat, getChatHistory, clearChatHistory } from "../controllers/chatController.js";

const router = Router();

router.use(authenticate);

router.post("/query", queryChat);
router.get("/:bookId/history", getChatHistory);
router.delete("/:bookId/history", clearChatHistory);

export default router;
