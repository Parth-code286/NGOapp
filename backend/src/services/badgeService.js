import { volunteerModel } from "../models/volunteerModel.js";
import { badgeModel } from "../models/badgeModel.js";
import { eventModel } from "../models/eventModel.js";

export const badgeService = {
    /**
     * Check all badge conditions for a volunteer and assign
     * any newly earned badges. Returns array of new badge names.
     */
    checkAndAssign: async (volunteerId) => {
        // Get volunteer stats
        const volunteer = await volunteerModel.getById(volunteerId);
        if (!volunteer) return [];

        // Count environment events attended (for Eco Warrior badge)
        const environmentEventsCount = await eventModel.countEnvironmentEvents(volunteerId);

        // Get all badge definitions
        const allBadges = await badgeModel.getAllBadges();

        // Get already-earned badge IDs (as a Set for O(1) lookup)
        const earnedBadgeIds = await badgeModel.getEarnedBadgeIds(volunteerId);

        const newlyAssigned = [];

        for (const badge of allBadges) {
            // Skip already earned
            if (earnedBadgeIds.has(badge.id)) continue;

            let qualifies = false;

            if (badge.condition_type === "events_attended") {
                qualifies = volunteer.events_attended >= badge.condition_value;
            } else if (badge.condition_type === "environment_events") {
                qualifies = environmentEventsCount >= badge.condition_value;
            }

            if (qualifies) {
                try {
                    await badgeModel.assignBadge(volunteerId, badge.id);
                    newlyAssigned.push(badge.name);
                } catch (_) {
                    // Skip if duplicate or error — don't fail the whole request
                }
            }
        }

        return newlyAssigned;
    },
};
