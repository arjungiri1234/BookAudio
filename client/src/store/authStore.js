import { create } from "zustand";
import { supabase } from "../services/supabase";

const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    // Initialize — call once on app load
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({ user: session?.user ?? null, session, loading: false });

            // Listen for auth state changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ user: session?.user ?? null, session });
            });
        } catch {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        set({ user: data.user, session: data.session });
    },

    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        set({ user: data.user, session: data.session });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));

export default useAuthStore;
