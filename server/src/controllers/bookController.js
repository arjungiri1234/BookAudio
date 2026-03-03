import { supabase } from "../config/supabase.js";
import { parseBook } from "../services/bookParser.js";
import { chunkText } from "../utils/chunker.js";
import { generateEmbeddings } from "../services/embeddings.js";
import { semanticSearch } from "../services/search.js";

/**
 * POST /api/books/upload — Upload, parse, and index a book
 */
export const uploadBook = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { originalname, buffer, mimetype } = req.file;
        const userId = req.userId;
        const fileType = originalname.split(".").pop().toLowerCase();

        // Clean filename for use as a title: remove extension, replace separators, title-case
        const cleanTitle = originalname
            .replace(/\.[^/.]+$/, "")      // remove extension
            .replace(/[-_]+/g, " ")        // replace hyphens/underscores with spaces
            .replace(/\s+/g, " ")          // collapse multiple spaces
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase()); // title case

        // 1. Upload to Supabase Storage
        const filePath = `${userId}/${Date.now()}_${originalname}`;
        const { error: uploadError } = await supabase.storage
            .from("books")
            .upload(filePath, buffer, { contentType: mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("books").getPublicUrl(filePath);

        // 2. Create book record with cleaned filename as initial title
        const { data: book, error: dbError } = await supabase
            .from("books")
            .insert({
                user_id: userId,
                title: cleanTitle,
                file_url: urlData.publicUrl,
                file_type: fileType,
                status: "processing",
            })
            .select()
            .single();

        if (dbError) throw dbError;

        // 3. Parse + chunk + embed in background
        processBookAsync(book.id, buffer, fileType, cleanTitle);

        res.status(201).json(book);
    } catch (err) {
        next(err);
    }
};

/**
 * Background processing — parse, chunk, embed
 */
async function processBookAsync(bookId, buffer, fileType, cleanTitle) {
    try {
        // Parse text from file
        const { text, pages, metadata } = await parseBook(buffer, fileType);

        // Chunk the text
        const chunks = chunkText(text, { pages, metadata });

        // Generate embeddings and store
        await generateEmbeddings(bookId, chunks);

        // Update book status
        const updateData = {
            status: "ready",
            total_pages: pages || null,
            total_chunks: chunks.length,
        };

        // Use PDF/EPUB metadata title only if it's meaningful
        const metaTitle = metadata?.title?.trim();
        const skipTitles = ["untitled", "microsoft word", "unknown"];
        if (metaTitle && metaTitle.length > 1 && !skipTitles.some(s => metaTitle.toLowerCase().includes(s))) {
            updateData.title = metaTitle;
        }
        // Otherwise the cleanTitle from the filename (set at insert time) stays

        // Author from metadata, or leave null
        const metaAuthor = metadata?.author?.trim();
        if (metaAuthor && metaAuthor.length > 1) {
            updateData.author = metaAuthor;
        }

        await supabase
            .from("books")
            .update(updateData)
            .eq("id", bookId);

        console.log(`✅ Book ${bookId} processed: ${chunks.length} chunks`);
    } catch (err) {
        console.error(`❌ Failed to process book ${bookId}:`, err);
        await supabase
            .from("books")
            .update({ status: "error" })
            .eq("id", bookId);
    }
}

/**
 * GET /api/books — Get all books for current user
 */
export const getBooks = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("user_id", req.userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/books/:id — Get single book details
 */
export const getBookById = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("id", req.params.id)
            .eq("user_id", req.userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/books/:id — Delete a book and its chunks
 */
export const deleteBook = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("books")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", req.userId);

        if (error) throw error;
        res.json({ message: "Book deleted" });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/books/:id/chunks — Get all chunks for a book
 */
export const getBookChunks = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("book_chunks")
            .select("id, chunk_index, content, page_number, chapter_title, section_title")
            .eq("book_id", req.params.id)
            .order("chunk_index", { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/books/:id/search — Semantic search within a book
 * Used by the voice assistant for client-side tool call handling
 */
export const searchBook = async (req, res, next) => {
    try {
        const { query } = req.body;
        const bookId = req.params.id;

        if (!query) {
            return res.status(400).json({ error: "query is required" });
        }

        const results = await semanticSearch(query, bookId);
        res.json(
            results.map((r) => ({
                content: r.content,
                page_number: r.page_number,
                chapter_title: r.chapter_title,
                section_title: r.section_title,
                similarity: r.similarity,
            }))
        );
    } catch (err) {
        next(err);
    }
};
