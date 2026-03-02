/**
 * Split book text into semantic chunks (~500 tokens each)
 * @param {string} text - Full book text
 * @param {object} options - { pages, metadata }
 * @returns {Array<{ content, chunk_index, page_number, chapter_title, section_title }>}
 */
export function chunkText(text, options = {}) {
    const MAX_CHUNK_SIZE = 1500; // ~500 tokens ≈ 1500 chars
    const OVERLAP = 200; // Character overlap between chunks

    if (!text || text.trim().length === 0) {
        return [];
    }

    // Split by double newlines first (natural paragraph breaks)
    const paragraphs = text.split(/\n{2,}/);
    const chunks = [];
    let currentChunk = "";
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;

        // If adding this paragraph exceeds max size, save the current chunk
        if (currentChunk.length + trimmed.length > MAX_CHUNK_SIZE && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.trim(),
                chunk_index: chunkIndex,
                page_number: estimatePageNumber(chunkIndex, chunks.length, options.pages),
                chapter_title: null,
                section_title: null,
            });
            chunkIndex++;

            // Keep overlap from the end of the current chunk
            currentChunk = currentChunk.slice(-OVERLAP) + "\n\n" + trimmed;
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
        }
    }

    // Don't forget the last chunk
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk.trim(),
            chunk_index: chunkIndex,
            page_number: estimatePageNumber(chunkIndex, chunks.length + 1, options.pages),
            chapter_title: null,
            section_title: null,
        });
    }

    return chunks;
}

/**
 * Rough page number estimation based on chunk position
 */
function estimatePageNumber(chunkIndex, totalChunks, totalPages) {
    if (!totalPages || !totalChunks) return null;
    return Math.ceil((chunkIndex / Math.max(totalChunks, 1)) * totalPages);
}
