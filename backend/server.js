import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import supabase from "./src/config/supabase.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check — verifies Supabase connectivity
app.get("/health", async (req, res) => {
    try {
        await supabase.from("_health_check").select("*").limit(1);
        res.json({ status: "ok", supabase: "connected" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, async () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔗 Auth routes: /api/auth/login | /api/auth/register/volunteer | /api/auth/register/ngo`);
    try {
        await supabase.from("_health_check").select("*").limit(1);
        console.log("✅ Supabase connected");
    } catch (err) {
        console.error("❌ Supabase connection failed:", err.message);
    }
});
