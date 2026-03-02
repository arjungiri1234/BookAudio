import { create } from "zustand";
import api from "../services/api";

const useBookStore = create((set, get) => ({
    books: [],
    currentBook: null,
    loading: false,

    fetchBooks: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get("/api/books");
            set({ books: data, loading: false });
        } catch (err) {
            console.error("Failed to fetch books:", err);
            set({ loading: false });
        }
    },

    fetchBookById: async (id) => {
        const { data } = await api.get(`/api/books/${id}`);
        set({ currentBook: data });
        return data;
    },

    uploadBook: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/api/books/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        // Add the new book to the list
        set((state) => ({ books: [data, ...state.books] }));
        return data;
    },

    deleteBook: async (id) => {
        await api.delete(`/api/books/${id}`);
        set((state) => ({
            books: state.books.filter((b) => b.id !== id),
            currentBook: state.currentBook?.id === id ? null : state.currentBook,
        }));
    },
}));

export default useBookStore;
