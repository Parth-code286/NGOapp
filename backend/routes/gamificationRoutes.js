import express from "express";
import {
    getStats,
    getLeaderboard,
    getVolunteerBadges,
    checkBadges,
} from "../controllers/gamificationController.js";

const router = express.Router();

// GET /gamification/stats/:volunteerId
router.get("/stats/:volunteerId", getStats);

// GET /gamification/leaderboard
router.get("/leaderboard", getLeaderboard);

// GET /gamification/badges/:volunteerId
router.get("/badges/:volunteerId", getVolunteerBadges);

// POST /gamification/check-badges
router.post("/check-badges", checkBadges);

export default router;
