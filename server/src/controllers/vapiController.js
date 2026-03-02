import { semanticSearch } from "../services/search.js";

/**
 * POST /api/vapi/tool-call — Handle Vapi AI tool calls
 */
export const handleToolCall = async (req, res, next) => {
    try {
        // TODO: Verify Vapi webhook signature using VAPI_WEBHOOK_SECRET
        const { message } = req.body;

        if (message?.type === "tool-calls") {
            const toolCalls = message.toolCalls || [];
            const results = [];

            for (const toolCall of toolCalls) {
                if (toolCall.function?.name === "search_book") {
                    const { query, book_id } = toolCall.function.arguments;
                    const searchResults = await semanticSearch(query, book_id);

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

            return res.json({ results });
        }

        res.json({ message: "ok" });
    } catch (err) {
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
