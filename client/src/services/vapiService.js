// vapiService.js — Vapi AI SDK setup and call handlers
// import Vapi from "@vapi-ai/web";

let vapi = null;

// Lazy initialization
function getVapi() {
    if (!vapi) {
        // Uncomment when @vapi-ai/web is installed and configured
        // const Vapi = (await import("@vapi-ai/web")).default;
        // vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
        console.warn("Vapi SDK not yet initialized. Set VITE_VAPI_PUBLIC_KEY in .env");
    }
    return vapi;
}

// Tool definition for book search
const searchBookTool = {
    name: "search_book",
    description:
        "Search the book for content related to a question. Returns relevant sections with page numbers and chapter titles.",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string", description: "The search query or question" },
            book_id: { type: "string", description: "The ID of the book to search" },
        },
        required: ["query", "book_id"],
    },
};

/**
 * Start a voice session for a specific book
 */
export async function startBookSession(bookId, bookTitle) {
    const client = getVapi();
    if (!client) {
        throw new Error("Vapi SDK not initialized");
    }

    return client.start({
        assistant: {
            name: "Book Assistant",
            firstMessage: `Hello! I'm ready to help you explore "${bookTitle}". What would you like to know?`,
            model: {
                provider: "openai",
                model: "gpt-4o",
                systemPrompt: `You are an expert assistant for the book "${bookTitle}". 
          Use the search_book tool to find relevant sections before answering.
          Always cite the page number and chapter when referencing content.
          The book_id is: ${bookId}`,
                tools: [{ type: "function", function: searchBookTool }],
            },
            voice: { provider: "11labs", voiceId: "rachel" },
        },
    });
}

/**
 * Stop the current voice session
 */
export function stopSession() {
    const client = getVapi();
    if (client) {
        client.stop();
    }
}

/**
 * Hook helper for Vapi events (call from components)
 */
export function useVapiEvents(handlers = {}) {
    const client = getVapi();
    if (!client) return;

    if (handlers.onSpeechStart) client.on("speech-start", handlers.onSpeechStart);
    if (handlers.onSpeechEnd) client.on("speech-end", handlers.onSpeechEnd);
    if (handlers.onCallEnd) client.on("call-end", handlers.onCallEnd);
    if (handlers.onError) client.on("error", handlers.onError);
}
