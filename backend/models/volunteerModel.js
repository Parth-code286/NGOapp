import supabase from "../config/supabaseClient.js";

export const volunteerModel = {
    // Get volunteer by ID (full profile + gamification)
    getById: async (id) => {
        const { data, error } = await supabase
            .from("volunteers")
            .select("id, name, dob, gender, nationality, email, phone, city, state, country, pincode, aadhar, pan, interests, points, level, streak, events_attended, created_at")
            .eq("id", id)
            .single();
        if (error) throw new Error(error.message);
        return data;
    },


    // Update volunteer points and level atomically
    updatePointsAndLevel: async (id, newPoints, newLevel) => {
        const { error } = await supabase
            .from("volunteers")
            .update({ points: newPoints, level: newLevel })
            .eq("id", id);
        if (error) throw new Error(error.message);
    },

    // Increment events_attended by 1
    incrementEventsAttended: async (id) => {
        const { data: volunteer, error: fetchError } = await supabase
            .from("volunteers")
            .select("events_attended")
            .eq("id", id)
            .single();
        if (fetchError) throw new Error(fetchError.message);

        const { error } = await supabase
            .from("volunteers")
            .update({ events_attended: volunteer.events_attended + 1 })
            .eq("id", id);
        if (error) throw new Error(error.message);

        return volunteer.events_attended + 1;
    },

    // Log a point transaction to points_history
    logPointsHistory: async (volunteerId, action, points, eventId = null) => {
        const { error } = await supabase.from("points_history").insert({
            volunteer_id: volunteerId,
            action,
            points,
            event_id: eventId,
        });
        if (error) throw new Error(error.message);
    },

    // Get top N volunteers by points for leaderboard
    getLeaderboard: async (limit = 10) => {
        const { data, error } = await supabase
            .from("volunteers")
            .select("id, name, points, level, events_attended")
            .order("points", { ascending: false })
            .limit(limit);
        if (error) throw new Error(error.message);
        return data;
    },
};
