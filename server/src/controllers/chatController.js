import { supabase } from "../config/supabase.js";
import { semanticSearch } from "../services/search.js";
import { generateAnswer } from "../services/llm.js";

/**
 * POST /api/chat/query — Ask a question about a book
 */
export const queryChat = async (req, res, next) => {
    try {
        const { book_id, question } = req.body;

        if (!book_id || !question) {
            return res.status(400).json({ error: "book_id and question are required" });
        }

        // Check if the message is a casual/greeting message
        const casualPatterns = /^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening|night)|how\s*are\s*you|what'?s\s*up|sup|yo|bye|goodbye|thanks|thank\s*you|ok|okay|cool|nice|great|awesome)[!?.]*$/i;
        const isCasual = casualPatterns.test(question.trim());

        // 1. Semantic search for relevant chunks (skip for casual messages)
        const relevantChunks = isCasual ? [] : await semanticSearch(question, book_id);
        console.log(`🔍 Found ${relevantChunks.length} relevant chunks for: "${question}"${isCasual ? ' (casual)' : ''}`);

        // 2. Generate answer using LLM with context
        const answer = await generateAnswer(question, relevantChunks);

        // 3. Save to chat history
        await supabase.from("chat_messages").insert([
            {
                book_id,
                user_id: req.userId,
                role: "user",
                content: question,
            },
            {
                book_id,
                user_id: req.userId,
                role: "assistant",
                content: answer,
                source_chunks: relevantChunks.map((c) => ({
                    chunk_id: c.id,
                    page_number: c.page_number,
                    chapter_title: c.chapter_title,
                    content: c.content?.substring(0, 200),
                })),
            },
        ]);

        res.json({
            answer,
            sources: relevantChunks.map((c) => ({
                id: c.id,
                page_number: c.page_number,
                chapter_title: c.chapter_title,
                section_title: c.section_title,
                content: c.content,
                similarity: c.similarity,
            })),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/chat/:bookId/history — Get chat history for a book
 */
export const getChatHistory = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("book_id", req.params.bookId)
            .eq("user_id", req.userId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/chat/:bookId/history — Clear chat history
 */
export const clearChatHistory = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("chat_messages")
            .delete()
            .eq("book_id", req.params.bookId)
            .eq("user_id", req.userId);

        if (error) throw error;
        res.json({ message: "Chat history cleared" });
    } catch (err) {
        next(err);
    }
};
