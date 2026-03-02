import express from "express";
import cors from "cors";
import bookRoutes from "./routes/bookRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import vapiRoutes from "./routes/vapiRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ─── Middleware ────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────
app.use("/api/books", bookRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vapi", vapiRoutes);

// ─── 404 handler ──────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ─── Error handler (must be last) ─────────
app.use(errorHandler);

export default app;
