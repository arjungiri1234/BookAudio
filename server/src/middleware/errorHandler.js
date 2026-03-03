/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);
    console.error(err.stack);

    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File size exceeds 50MB limit" });
    }

    if (err.message?.includes("Invalid file type")) {
        return res.status(400).json({ error: err.message });
    }

    const statusCode = Number(err.statusCode) || 500;
    res.status(statusCode).json({
        error: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
