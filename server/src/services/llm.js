import { genAI } from "../config/gemini.js";

/**
 * Generate an answer using Gemini LLM with retrieved context chunks
 * @param {string} question - User's question
 * @param {Array} chunks - Relevant chunks from semantic search
 * @returns {string} Generated answer with citations
 */
export async function generateAnswer(question, chunks) {
    // Build context from retrieved chunks
    const context = chunks
        .map((chunk, i) => {
            let ref = `[Source ${i + 1}]`;
            if (chunk.chapter_title) ref += ` Chapter: ${chunk.chapter_title}`;
            if (chunk.page_number) ref += ` | Page ${chunk.page_number}`;
            return `${ref}\n${chunk.content}`;
        })
        .join("\n\n---\n\n");

    const systemPrompt = `You are a friendly and knowledgeable book assistant. Your primary job is to help users explore and understand the book content provided below.

Rules:
- For greetings or casual messages (like "hi", "how are you", "hello"), respond warmly and invite the user to ask questions about the book
- For book-related questions, answer based on the provided book excerpts and always cite your sources using page numbers and chapter titles when available
- If a book-related question can't be answered from the excerpts, say "I couldn't find information about that in this book"
- Be concise but thorough
- Use direct quotes from the text when appropriate, with page references
- ABSOLUTELY DO NOT use any emojis, icons, or symbols like ✅, ❌, 👍, etc. in your responses. Keep the text clean and professional.

Book Excerpts:
${context}`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
        },
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    return response.text();
}
