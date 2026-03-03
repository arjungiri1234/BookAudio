import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { HiOutlinePlus, HiOutlineBookOpen, HiOutlineClock, HiOutlineTrash } from "react-icons/hi2";
import BookUploader from "../components/BookUploader";
import useBookStore from "../store/bookStore";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [showUploader, setShowUploader] = useState(false);
  const { books, fetchBooks, loading, deleteBook } = useBookStore();

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigating to the book detail page
    e.stopPropagation();
    try {
      await deleteBook(id);
      toast.success("Book deleted successfully");
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Poll for status updates when any book is still processing
  useEffect(() => {
    const hasProcessing = books.some((b) => b.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchBooks();
    }, 3000);

    return () => clearInterval(interval);
  }, [books, fetchBooks]);

  const statusBadge = (status) => {
    const styles = {
      ready: "bg-emerald-50 text-emerald-600 border-emerald-200",
      processing: "bg-amber-50 text-amber-600 border-amber-200",
      error: "bg-red-50 text-red-600 border-red-200",
    };
    return styles[status] || styles.processing;
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-surface-800">My Books</h1>
          <p className="text-surface-500 mt-1 text-sm sm:text-base">
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

      {/* Upload Modal - Rendered via Portal to escape stacking contexts */}
      {showUploader && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-950/40 backdrop-blur-md p-4">
          <div className="bg-surface-50 border border-surface-300 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-xl fade-in relative">
            <button
              onClick={() => setShowUploader(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-700 p-2 rounded-full hover:bg-surface-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-surface-800">Upload a Book</h2>
              <p className="text-surface-500 text-sm mt-1">Add a new book to your audio library</p>
            </div>
            <BookUploader onComplete={() => { setShowUploader(false); fetchBooks(); }} />
          </div>
        </div>,
        document.body
      )}

      {/* Book Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-200 flex items-center justify-center">
            <HiOutlineBookOpen className="w-8 h-8 text-surface-400" />
          </div>
          <h2 className="text-xl font-semibold text-surface-800 mb-2">No books yet</h2>
          <p className="text-surface-500 mb-6">Upload your first book to start exploring</p>
          <button
            onClick={() => setShowUploader(true)}
            className="btn-primary"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Upload Your First Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="glass-card p-4 sm:p-5 hover:border-primary-300 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center flex-shrink-0">
                  <HiOutlineBookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(book.status)}`}
                  >
                    {book.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, book.id)}
                    className="flex justify-center items-center h-8 w-8 text-red-500 opacity-75 hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 rounded-full"
                    title="Delete Book"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-1 text-surface-800 group-hover:text-primary-700 transition-colors truncate">
                {book.title}
              </h3>
              {book.author && book.author.trim() && (
                <p className="text-surface-500 text-sm mb-3 truncate">by {book.author}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-surface-400">
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
