import { genAI } from "../config/gemini.js";
import { supabase } from "../config/supabase.js";

const EMBEDDING_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 20; // Process embeddings in batches

/**
 * Generate embeddings for all chunks and store in Supabase
 * @param {string} bookId - Book UUID
 * @param {Array} chunks - Array of chunk objects
 */
export async function generateEmbeddings(bookId, chunks) {
    console.log(`🔢 Generating embeddings for ${chunks.length} chunks...`);

    const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const texts = batch.map((c) => c.content);

        // Generate embeddings via Gemini (batch embed) — 3072 dimensions
        const result = await embeddingModel.batchEmbedContents({
            requests: texts.map((text) => ({
                content: { parts: [{ text }] },
            })),
        });

        // Prepare rows for Supabase
        const rows = batch.map((chunk, j) => ({
            book_id: bookId,
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            page_number: chunk.page_number,
            chapter_title: chunk.chapter_title,
            section_title: chunk.section_title,
            embedding: result.embeddings[j].values,
        }));

        // Insert into Supabase
        const { error } = await supabase.from("book_chunks").insert(rows);
        if (error) {
            console.error(`Failed to insert batch ${i / BATCH_SIZE + 1}:`, error);
            throw error;
        }

        console.log(`  📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} stored`);
    }

    console.log(`✅ All ${chunks.length} embeddings stored`);
}
