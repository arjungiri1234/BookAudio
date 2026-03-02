import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

// Admin client — bypasses RLS (for server-side operations)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Connection Test ──────────────────────
(async () => {
    try {
        const { error } = await supabase.from("books").select("id").limit(1);
        if (error) {
            console.error("❌ Supabase connection failed (server):", error.message);
        } else {
            console.log("✅ Supabase connected successfully (server)");
        }
    } catch (err) {
        console.error("❌ Supabase connection error (server):", err.message);
    }
})();
