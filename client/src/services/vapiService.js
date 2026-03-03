import Vapi from "@vapi-ai/web";

let vapi = null;

// Lazy initialization
function getVapi() {
    if (!vapi) {
        const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
        if (!publicKey) {
            console.warn("⚠️ Missing VITE_VAPI_PUBLIC_KEY in .env");
            return null;
        }
        vapi = new Vapi(publicKey);
    }
    return vapi;
}

/**
 * Start a voice session for a specific book
 */
export async function startBookSession(bookId, bookTitle) {
    const client = getVapi();
    if (!client) {
        throw new Error("Vapi SDK not initialized — check VITE_VAPI_PUBLIC_KEY");
    }

    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    return client.start({
        name: "Book Assistant",
        firstMessage: `Hello! I'm ready to help you explore "${bookTitle}". What would you like to know?`,
        model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a friendly and expert voice assistant for the book "${bookTitle}". 
Use the search_book tool to find relevant sections before answering.
Always cite the page number and chapter when referencing content.
For greetings, respond warmly and invite the user to ask about the book.
The book_id is: ${bookId}`,
                },
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "search_book",
                        description: "Search the book for content related to a question.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: { type: "string" },
                                book_id: { type: "string" },
                            },
                            required: ["query", "book_id"],
                        },
                    },
                    server: {
                        url: `${serverUrl}/api/vapi/tool-call`,
                    },
                },
            ],
        },
        voice: {
            provider: "playht",
            voiceId: "jennifer",
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
 * Register Vapi event listeners
 */
export function onVapiEvent(event, handler) {
    const client = getVapi();
    if (client && handler) {
        client.on(event, handler);
    }
}

/**
 * Remove Vapi event listeners
 */
export function offVapiEvent(event, handler) {
    const client = getVapi();
    if (client && handler) {
        client.off(event, handler);
    }
}
