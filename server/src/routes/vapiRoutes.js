import { Router } from "express";
import { handleToolCall, handleEndOfCall } from "../controllers/vapiController.js";

const router = Router();

// Vapi webhooks — no auth middleware (authenticated via webhook secret)
router.post("/tool-call", handleToolCall);
router.post("/end-of-call", handleEndOfCall);

export default router;
