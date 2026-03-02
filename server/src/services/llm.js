import { openai } from "../config/openai.js";

/**
 * Generate an answer using LLM with retrieved context chunks
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

    const systemPrompt = `You are a knowledgeable book assistant. Answer the user's question based ONLY on the provided book excerpts below. 

Rules:
- Always cite your sources using page numbers and chapter titles when available
- If the answer isn't in the provided excerpts, say "I couldn't find information about that in this book"
- Be concise but thorough
- Use direct quotes from the text when appropriate, with page references

Book Excerpts:
${context}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 1000,
    });

    return response.choices[0].message.content;
}
