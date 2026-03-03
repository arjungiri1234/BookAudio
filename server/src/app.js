import express from "express";
import cors from "cors";
import bookRoutes from "./routes/bookRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import vapiRoutes from "./routes/vapiRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ─── Middleware ────────────────────────────
// VAPI webhooks come from external servers — allow all origins on those routes
app.use("/api/vapi", cors());
app.use(cors({
    origin: process.env.CLIENT_URL || [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────
// VAPI routes first (no auth needed, open CORS)
app.use("/api/vapi", vapiRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/chat", chatRoutes);

// ─── 404 handler ──────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ─── Error handler (must be last) ─────────
app.use(errorHandler);

export default app;
