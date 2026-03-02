// supabase.js — Supabase client initialization
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Connection Test ──────────────────────
(async () => {
    try {
        const { error } = await supabase.from("books").select("id").limit(1);
        if (error) {
            console.error(" Supabase connection failed:", error.message);
        } else {
            console.log(" Supabase connected successfully (client)");
        }
    } catch (err) {
        console.error(" Supabase connection error:", err.message);
    }
})();
