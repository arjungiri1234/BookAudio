import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlineTrash } from "react-icons/hi2";
import toast from "react-hot-toast";
import ChatBox from "../components/ChatBox";
import VoiceAssistant from "../components/VoiceAssistant";
import useBookStore from "../store/bookStore";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBook, fetchBookById, deleteBook } = useBookStore();
  const [activeTab, setActiveTab] = useState("chat");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchBookById(id);
      } catch {
        toast.error("Book not found");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchBookById, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      toast.success("Book deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete book");
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate("/dashboard")} className="btn-ghost mt-1 p-2">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentBook?.title}</h1>
            {currentBook?.author && (
              <p className="text-surface-200/50 mt-1">by {currentBook.author}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-surface-200/40">
              {currentBook?.total_pages && <span>{currentBook.total_pages} pages</span>}
              {currentBook?.total_chunks && <span>•  {currentBook.total_chunks} chunks indexed</span>}
            </div>
          </div>
        </div>
        <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300">
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 glass-card w-fit mb-6">
        <button
          id="chat-tab"
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "chat"
              ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
              : "text-surface-200/60 hover:text-white"
            }`}
        >
          💬 Chat
        </button>
        <button
          id="voice-tab"
          onClick={() => setActiveTab("voice")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "voice"
              ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
              : "text-surface-200/60 hover:text-white"
            }`}
        >
          🎙️ Voice
        </button>
      </div>

      {/* Content */}
      <div className="glass-card p-6 min-h-[60vh]">
        {activeTab === "chat" ? (
          <ChatBox bookId={id} bookTitle={currentBook?.title} />
        ) : (
          <VoiceAssistant bookId={id} bookTitle={currentBook?.title} />
        )}
      </div>
    </div>
  );
}
