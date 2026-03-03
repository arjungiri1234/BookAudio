import { semanticSearch } from "../services/search.js";

/**
 * POST /api/vapi/tool-call — Handle Vapi AI tool calls
 * 
 * VAPI sends tool-call requests when the assistant invokes a function.
 * The payload can vary depending on VAPI version. We handle multiple formats.
 */
export const handleToolCall = async (req, res, next) => {
    try {
        const body = req.body;
        console.log("📥 VAPI tool-call received:", JSON.stringify(body, null, 2));

        // Extract tool calls from various VAPI payload formats
        const message = body.message || body;
        const toolCalls = message.toolCalls || message.toolCallList || [];

        // Also handle direct tool call format (single tool call)
        if (message.functionCall || message.toolCall) {
            const singleCall = message.functionCall || message.toolCall;
            toolCalls.push({
                id: singleCall.id || "single",
                function: {
                    name: singleCall.name || singleCall.function?.name,
                    arguments: singleCall.parameters || singleCall.arguments || singleCall.function?.arguments,
                },
            });
        }

        const results = [];

        for (const toolCall of toolCalls) {
            const funcName = toolCall.function?.name || toolCall.name;
            const args = toolCall.function?.arguments || toolCall.arguments || {};

            // Parse arguments if they're a string
            const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

            console.log(`🔍 Tool call: ${funcName}`, parsedArgs);

            if (funcName === "search_book") {
                const { query, book_id } = parsedArgs;

                if (!query || !book_id) {
                    console.warn("⚠️ Missing query or book_id:", { query, book_id });
                    results.push({
                        toolCallId: toolCall.id,
                        result: JSON.stringify({ error: "Missing query or book_id" }),
                    });
                    continue;
                }

                const searchResults = await semanticSearch(query, book_id);
                console.log(`✅ Search returned ${searchResults.length} results for "${query}"`);

                results.push({
                    toolCallId: toolCall.id,
                    result: JSON.stringify(
                        searchResults.map((r) => ({
                            content: r.content,
                            page: r.page_number,
                            chapter: r.chapter_title,
                            section: r.section_title,
                            similarity: r.similarity,
                        }))
                    ),
                });
            }
        }

        if (results.length > 0) {
            console.log("📤 Sending results:", results.length, "tool responses");
            return res.json({ results });
        }

        // If no tool calls matched, still return ok
        console.log("ℹ️ No matching tool calls, returning ok");
        res.json({ message: "ok" });
    } catch (err) {
        console.error("❌ VAPI tool-call error:", err);
        next(err);
    }
};

/**
 * POST /api/vapi/end-of-call — Log call completion
 */
export const handleEndOfCall = async (req, res, next) => {
    try {
        const { message } = req.body;
        console.log("📞 Vapi call ended:", message?.call?.id);
        res.json({ message: "ok" });
    } catch (err) {
        next(err);
    }
};
