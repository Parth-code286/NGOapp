import supabase from "../config/supabaseClient.js";

export const badgeModel = {
    // Get all badge definitions
    getAllBadges: async () => {
        const { data, error } = await supabase.from("badges").select("*");
        if (error) throw new Error(error.message);
        return data || [];
    },

    // Get badge IDs already earned by volunteer
    getEarnedBadgeIds: async (volunteerId) => {
        const { data } = await supabase
            .from("volunteer_badges")
            .select("badge_id")
            .eq("volunteer_id", volunteerId);
        return new Set((data || []).map((b) => b.badge_id));
    },

    // Assign a badge to a volunteer
    assignBadge: async (volunteerId, badgeId) => {
        const { error } = await supabase.from("volunteer_badges").insert({
            volunteer_id: volunteerId,
            badge_id: badgeId,
        });
        if (error) throw new Error(error.message);
    },

    // Get all badges earned by a volunteer (with badge details)
    getVolunteerBadges: async (volunteerId) => {
        const { data, error } = await supabase
            .from("volunteer_badges")
            .select("earned_at, badges(name, description, icon, condition_type, condition_value)")
            .eq("volunteer_id", volunteerId)
            .order("earned_at", { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map((b) => ({ ...b.badges, earned_at: b.earned_at }));
    },
};
