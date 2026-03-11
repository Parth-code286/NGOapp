import { volunteerModel } from "../models/volunteerModel.js";
import { badgeModel } from "../models/badgeModel.js";
import { badgeService } from "../services/badgeService.js";
import { awardPoints } from "../services/pointsService.js";

// POST /tasks/complete
export const completeTask = async (req, res) => {
    const { volunteer_id, event_id } = req.body;
    if (!volunteer_id)
        return res.status(400).json({ error: "volunteer_id is required." });

    try {
        const result = await awardPoints(volunteer_id, 30, "task_completed", event_id || null);
        return res.status(200).json({
            message: "Task completed. Points awarded.",
            points_awarded: 30,
            total_points: result.newPoints,
            level: result.newLevel,
            new_badges: result.newBadges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// POST /crisis/participate
export const crisisParticipate = async (req, res) => {
    const { volunteer_id, event_id } = req.body;
    if (!volunteer_id)
        return res.status(400).json({ error: "volunteer_id is required." });

    try {
        const result = await awardPoints(volunteer_id, 100, "crisis_participation", event_id || null);
        return res.status(200).json({
            message: "Crisis participation recorded. Points awarded.",
            points_awarded: 100,
            total_points: result.newPoints,
            level: result.newLevel,
            new_badges: result.newBadges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /gamification/stats/:volunteerId
export const getStats = async (req, res) => {
    const { volunteerId } = req.params;
    try {
        const volunteer = await volunteerModel.getById(volunteerId);
        if (!volunteer)
            return res.status(404).json({ error: "Volunteer not found." });

        const badgeDetails = await badgeModel.getVolunteerBadges(volunteerId);
        const badges = badgeDetails.map((b) => b.name);

        return res.status(200).json({
            id: volunteer.id,
            name: volunteer.name,
            email: volunteer.email,
            points: volunteer.points,
            level: volunteer.level,
            streak: volunteer.streak,
            events_attended: volunteer.events_attended,
            badges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /gamification/leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const data = await volunteerModel.getLeaderboard(10);
        const leaderboard = data.map((v, i) => ({ rank: i + 1, ...v }));
        return res.status(200).json({ leaderboard });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /gamification/badges/:volunteerId
export const getVolunteerBadges = async (req, res) => {
    const { volunteerId } = req.params;
    try {
        const badges = await badgeModel.getVolunteerBadges(volunteerId);
        return res.status(200).json({ badges });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// POST /gamification/check-badges
export const checkBadges = async (req, res) => {
    const { volunteer_id } = req.body;
    if (!volunteer_id)
        return res.status(400).json({ error: "volunteer_id is required." });

    try {
        const newBadges = await badgeService.checkAndAssign(volunteer_id);
        return res.status(200).json({
            message: newBadges.length > 0
                ? `${newBadges.length} new badge(s) assigned.`
                : "No new badges yet. Keep going!",
            new_badges: newBadges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
