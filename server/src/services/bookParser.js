import pdf from "pdf-parse";

/**
 * Parse a book file buffer into text content
 * @param {Buffer} buffer - File buffer
 * @param {string} fileType - 'pdf' | 'epub' | 'txt'
 * @returns {{ text: string, pages: number|null, metadata: object }}
 */
export async function parseBook(buffer, fileType) {
    switch (fileType) {
        case "pdf":
            return parsePDF(buffer);
        case "epub":
            return parseEPUB(buffer);
        case "txt":
            return parseTXT(buffer);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

async function parsePDF(buffer) {
    const data = await pdf(buffer);
    return {
        text: data.text,
        pages: data.numpages,
        metadata: {
            title: data.info?.Title || null,
            author: data.info?.Author || null,
        },
    };
}

async function parseEPUB(buffer) {
    // epub2 requires a file path, so we write to a temp file
    const fs = await import("fs/promises");
    const path = await import("path");
    const os = await import("os");
    const { EPub } = await import("epub2");

    const tmpPath = path.join(os.tmpdir(), `book_${Date.now()}.epub`);
    await fs.writeFile(tmpPath, buffer);

    try {
        const epub = await EPub.createAsync(tmpPath);
        const chapters = [];

        for (const chapter of epub.flow) {
            try {
                const chapterText = await epub.getChapterAsync(chapter.id);
                // Strip HTML tags
                const cleanText = chapterText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                if (cleanText) chapters.push(cleanText);
            } catch {
                // Skip unreadable chapters
            }
        }

        return {
            text: chapters.join("\n\n"),
            pages: null,
            metadata: {
                title: epub.metadata?.title || null,
                author: epub.metadata?.creator || null,
            },
        };
    } finally {
        await fs.unlink(tmpPath).catch(() => { });
    }
}

function parseTXT(buffer) {
    const text = buffer.toString("utf-8");
    return {
        text,
        pages: null,
        metadata: {},
    };
}
