import { useState, useRef, useEffect } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import SectionCard from "./SectionCard";
import api from "../services/api";

export default function ChatBox({ bookId, bookTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/api/chat/${bookId}/history`);
        setMessages(data || []);
      } catch {
        // History might be empty, that's fine
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
        {
          role: "assistant",
          content: data.answer,
          source_chunks: data.sources,
        },
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

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-xl font-medium mb-2">💬 Chat with "{bookTitle}"</p>
              <p className="text-surface-200/50 text-sm">
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
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-surface-800/80 text-surface-50 rounded-bl-md"
                }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Source references */}
              {msg.source_chunks && msg.source_chunks.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                  <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider">
                    Sources
                  </p>
                  {msg.source_chunks.map((chunk, j) => (
                    <SectionCard key={j} chunk={chunk} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-800/80 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
  );
}
