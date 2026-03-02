import { supabase } from "../config/supabase.js";
import { parseBook } from "../services/bookParser.js";
import { chunkText } from "../utils/chunker.js";
import { generateEmbeddings } from "../services/embeddings.js";

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

        // 1. Upload to Supabase Storage
        const filePath = `${userId}/${Date.now()}_${originalname}`;
        const { error: uploadError } = await supabase.storage
            .from("books")
            .upload(filePath, buffer, { contentType: mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("books").getPublicUrl(filePath);

        // 2. Create book record
        const { data: book, error: dbError } = await supabase
            .from("books")
            .insert({
                user_id: userId,
                title: originalname.replace(/\.[^/.]+$/, ""),
                file_url: urlData.publicUrl,
                file_type: fileType,
                status: "processing",
            })
            .select()
            .single();

        if (dbError) throw dbError;

        // 3. Parse + chunk + embed in background
        processBookAsync(book.id, buffer, fileType);

        res.status(201).json(book);
    } catch (err) {
        next(err);
    }
};

/**
 * Background processing — parse, chunk, embed
 */
async function processBookAsync(bookId, buffer, fileType) {
    try {
        // Parse text from file
        const { text, pages, metadata } = await parseBook(buffer, fileType);

        // Chunk the text
        const chunks = chunkText(text, { pages, metadata });

        // Generate embeddings and store
        await generateEmbeddings(bookId, chunks);

        // Update book status
        await supabase
            .from("books")
            .update({
                status: "ready",
                total_pages: pages || null,
                total_chunks: chunks.length,
                author: metadata?.author || null,
                title: metadata?.title || undefined,
            })
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
