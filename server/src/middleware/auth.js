import { createClient } from "@supabase/supabase-js";

/**
 * Auth middleware — verifies Supabase JWT from the Authorization header
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization token" });
        }

        const token = authHeader.split(" ")[1];

        // Create a client scoped to this user's token
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(500).json({ error: "Authentication failed" });
    }
};
