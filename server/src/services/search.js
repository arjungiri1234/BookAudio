import { genAI } from "../config/gemini.js";
import { supabase } from "../config/supabase.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * Perform semantic search across a book's chunks
 * @param {string} query - User's question
 * @param {string} bookId - Book UUID
 * @param {number} topK - Number of results to return
 * @returns {Array} Matching chunks with similarity scores
 */
export async function semanticSearch(query, bookId, topK = 5) {
    // 1. Generate embedding for the query using Gemini (3072 dimensions)
    const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await embeddingModel.embedContent({
        content: { parts: [{ text: query }] },
    });
    const queryEmbedding = result.embedding.values;

    // 2. Call the Supabase match_book_chunks function (pgvector)
    const { data, error } = await supabase.rpc("match_book_chunks", {
        query_embedding: queryEmbedding,
        match_book_id: bookId,
        match_threshold: 0.3,
        match_count: topK,
    });

    if (error) {
        console.error("Semantic search error:", error);
        throw error;
    }

    return data || [];
}
