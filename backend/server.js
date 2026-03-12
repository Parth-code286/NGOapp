import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import supabase from "./src/config/supabaseClient.js";
import authRoutes from "./src/routes/authRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import gamificationRoutes from "./src/routes/gamificationRoutes.js";
import ngoProfileRoutes from "./src/routes/ngoProfileRoutes.js";
import volunteerProfileRoutes from "./src/routes/volunteerProfileRoutes.js";
import calendarRoutes from "./src/routes/calendarRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import inviteRoutes from "./src/routes/inviteRoutes.js";
import participationRoutes from "./src/routes/participationRoutes.js";

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/gamification", gamificationRoutes);
app.use("/api/ngo", ngoProfileRoutes);
app.use("/api/volunteer", volunteerProfileRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/participation", participationRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
    try {
        await supabase.from("_health_check").select("*").limit(1);
        res.json({ status: "ok", supabase: "connected" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5053;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Auth routes: /api/auth/login | /api/auth/register/volunteer | /api/auth/register/ngo`);
    console.log(`🎮 Gamification routes: /events/* | /gamification/*`);
    console.log(`🏢 NGO Profile routes: /api/ngo/*`);
    console.log(`🙋 Volunteer Profile routes: /api/volunteer/*`);
    console.log(`📅 Calendar routes: /api/calendar/*`);

    // Verify Supabase connection on startup
    try {
        await supabase.from("_health_check").select("*").limit(1);
        console.log("✅ Supabase connected");
    } catch (err) {
        console.error("❌ Supabase connection failed:", err.message);
    }
});
