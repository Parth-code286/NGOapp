import express from "express";
import dotenv from "dotenv";
dotenv.config();
import supabase from "./src/config/supabase.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — verifies Supabase connectivity
app.get("/health", async (req, res) => {
    try {
        // Any response from Supabase means we're connected
        await supabase.from("_health_check").select("*").limit(1);
        res.json({ status: "ok", supabase: "connected" });
    } catch (err) {
        // Only a network/auth failure means we're NOT connected
        res.status(500).json({ status: "error", message: err.message });
    }
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Verify Supabase connection on startup
    try {
        await supabase.from("_health_check").select("*").limit(1);
        console.log("Supabase connected ✅");
    } catch (err) {
        console.error("Supabase connection failed ❌:", err.message);
    }
});
