import express from "express";
import { getVolunteerHeatmap, getAdvancedStats, getCommunityImpactScore } from "../controllers/analyticsController.js";

const router = express.Router();

// GET /api/analytics/volunteer-heatmap
// Optional queries: ?days=30, ?eventId=UUID
router.get("/volunteer-heatmap", getVolunteerHeatmap);

// GET /api/analytics/stats
// Returns global advanced stats
router.get("/stats", getAdvancedStats);

// GET /api/analytics/impact-score
// Returns global impact score
router.get("/impact-score", getCommunityImpactScore);

export default router;
