import { Router } from "express";
import { handleToolCall, handleEndOfCall } from "../controllers/vapiController.js";

const router = Router();

// Vapi webhooks — no auth middleware (authenticated via webhook secret)
router.post("/tool-call", handleToolCall);
router.post("/end-of-call", handleEndOfCall);

// Catch-all for any other VAPI requests (debug)
router.all("*", (req, res) => {
    console.log(`📥 VAPI catch-all: ${req.method} ${req.originalUrl}`);
    console.log("   Body:", JSON.stringify(req.body, null, 2));

    // VAPI sometimes sends to the base serverUrl directly
    // Try to handle tool calls on the base path too
    if (req.method === "POST" && req.body) {
        const body = req.body;
        const message = body.message || body;

        // Check if this looks like a tool call
        if (message.type === "tool-calls" || message.toolCalls || message.functionCall || message.toolCall) {
            console.log("🔄 Redirecting to tool-call handler");
            return handleToolCall(req, res, (err) => {
                if (err) res.status(500).json({ error: err.message });
            });
        }

        // Check if end of call
        if (message.type === "end-of-call-report") {
            return handleEndOfCall(req, res, (err) => {
                if (err) res.status(500).json({ error: err.message });
            });
        }
    }

    res.json({ message: "ok" });
});

export default router;
