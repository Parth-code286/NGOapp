import { volunteerModel } from "../models/volunteerModel.js";
import { badgeService } from "./badgeService.js";

// Calculate volunteer level from total points
const calculateLevel = (points) => {
    if (points >= 1000) return 4;
    if (points >= 500) return 3;
    if (points >= 200) return 2;
    return 1;
};

/**
 * Core reusable function — awards points to a volunteer.
 * Steps:
 *  1. Update volunteer points
 *  2. Log to points_history
 *  3. Update volunteer level
 *  4. Check and assign badge eligibility
 */
export const awardPoints = async (volunteerId, points, action, eventId = null) => {
    // 1. Fetch current volunteer
    const volunteer = await volunteerModel.getById(volunteerId);
    if (!volunteer) throw new Error("Volunteer not found.");

    // 2. Calculate new points and level
    const newPoints = volunteer.points + points;
    const newLevel = calculateLevel(newPoints);

    // 3. Update volunteer points and level
    await volunteerModel.updatePointsAndLevel(volunteerId, newPoints, newLevel);

    // 4. Log points transaction
    await volunteerModel.logPointsHistory(volunteerId, action, points, eventId);

    // 5. Check badge eligibility and assign
    const newBadges = await badgeService.checkAndAssign(volunteerId);

    return { newPoints, newLevel, newBadges };
};
