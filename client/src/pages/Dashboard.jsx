import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlinePlus, HiOutlineBookOpen, HiOutlineClock, HiOutlineTrash } from "react-icons/hi2";
import BookUploader from "../components/BookUploader";
import useBookStore from "../store/bookStore";

export default function Dashboard() {
  const [showUploader, setShowUploader] = useState(false);
  const { books, fetchBooks, loading } = useBookStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const statusBadge = (status) => {
    const styles = {
      ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[status] || styles.processing;
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Books</h1>
          <p className="text-surface-200/60 mt-1">
            {books.length} {books.length === 1 ? "book" : "books"} in your library
          </p>
        </div>
        <button
          id="upload-book-btn"
          onClick={() => setShowUploader(true)}
          className="btn-primary"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Upload Book
        </button>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-lg fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload a Book</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="btn-ghost text-sm"
              >
                ✕
              </button>
            </div>
            <BookUploader onComplete={() => { setShowUploader(false); fetchBooks(); }} />
          </div>
        </div>
      )}

      {/* Book Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center">
            <HiOutlineBookOpen className="w-8 h-8 text-surface-200/40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No books yet</h2>
          <p className="text-surface-200/50 mb-6">Upload your first book to start exploring</p>
          <button
            onClick={() => setShowUploader(true)}
            className="btn-primary"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Upload Your First Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="glass-card p-5 hover:border-white/10 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <HiOutlineBookOpen className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(book.status)}`}
                >
                  {book.status}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-300 transition-colors line-clamp-1">
                {book.title}
              </h3>
              {book.author && (
                <p className="text-surface-200/50 text-sm mb-3">by {book.author}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-surface-200/40">
                <span className="flex items-center gap-1">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  {new Date(book.created_at).toLocaleDateString()}
                </span>
                {book.total_pages && <span>{book.total_pages} pages</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
