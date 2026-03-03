import { useState, useRef, useEffect } from "react";
import { HiOutlinePaperAirplane, HiOutlineXMark, HiOutlineDocumentText } from "react-icons/hi2";
import SectionCard from "./SectionCard";
import api from "../services/api";

export default function ChatBox({ bookId, bookTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingSource, setViewingSource] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/api/chat/${bookId}/history`);
        setMessages(data || []);
      } catch {
        // History might be empty
      }
    };
    if (bookId) loadHistory();
  }, [bookId]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/chat/query", {
        book_id: bookId,
        question: query,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, source_chunks: data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setViewingSource(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <div className="flex flex-col h-[60vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-xl font-medium text-surface-800 mb-2">💬 Chat about your book: "{bookTitle}"</p>
                <p className="text-surface-500 text-sm">
                  Ask any question about this book. I'll find the answer with page references.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-primary-700 text-white rounded-br-md"
                  : "bg-surface-200 text-surface-800 rounded-bl-md"
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Source references */}
                {msg.source_chunks && msg.source_chunks.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-surface-300 pt-3">
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Sources
                    </p>
                    {msg.source_chunks.map((chunk, j) => (
                      <SectionCard
                        key={j}
                        chunk={chunk}
                        onClick={(c) =>
                          setViewingSource({
                            ...c,
                            question: messages[i - 1]?.content || "",
                            answer: msg.content,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this book..."
            rows={1}
            className="input-field resize-none min-h-[44px] max-h-[120px]"
            style={{ height: "auto" }}
            disabled={loading}
          />
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary p-3 rounded-xl flex-shrink-0"
          >
            <HiOutlinePaperAirplane className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full-screen Source Viewer Modal */}
      {viewingSource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setViewingSource(null)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-surface-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <HiOutlineDocumentText className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-800 text-lg">
                    {viewingSource.chapter_title || "Source Content"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                    {viewingSource.page_number && <span>Page {viewingSource.page_number}</span>}
                    {viewingSource.section_title && <span>• {viewingSource.section_title}</span>}
                    {viewingSource.similarity && (
                      <span className="text-primary-600">
                        {Math.round(viewingSource.similarity * 100)}% match
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingSource(null)}
                className="p-2 rounded-lg hover:bg-surface-200 transition-colors text-surface-500 hover:text-surface-800"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {viewingSource.question && (
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Your Question</p>
                  <p className="text-primary-700 text-sm font-medium bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                    {viewingSource.question}
                  </p>
                </div>
              )}

              {viewingSource.answer && (
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Answer</p>
                  <p className="text-surface-700 text-sm leading-relaxed bg-surface-100 border border-surface-200 rounded-xl px-4 py-3 whitespace-pre-wrap">
                    {viewingSource.answer}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">📄 Relevant Source from Book</p>
                <div className="text-surface-700 text-sm leading-relaxed bg-surface-100 border border-surface-200 rounded-xl px-4 py-3">
                  {highlightContent(viewingSource.content, viewingSource.question)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-surface-200 bg-surface-50">
              <p className="text-xs text-surface-400 text-center">
                Press <kbd className="px-1.5 py-0.5 rounded bg-surface-200 text-surface-500 text-[10px]">ESC</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function highlightContent(content, question) {
  if (!content || !question) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const stopWords = new Set(["what", "is", "the", "a", "an", "of", "in", "to", "for", "and", "or", "how", "does", "do", "can", "this", "that", "it", "are", "was", "be", "has", "have", "hi", "hello", "hey", "please", "tell", "me", "about", "with"]);
  const keywords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const regex = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = content.split(regex);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        keywords.some((k) => part.toLowerCase() === k) ? (
          <mark key={i} className="bg-amber-100 text-amber-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
