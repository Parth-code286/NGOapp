import supabase from "../config/supabaseClient.js";

export const eventModel = {
    // ─── EVENTS CRUD ──────────────────────────────────────────────

    // Create a new event
    create: async (eventData) => {
        const { data, error } = await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Get all events (with optional filters)
    getAll: async (filters = {}) => {
        let query = supabase.from("events").select("*").order("event_date", { ascending: true });

        if (filters.category) query = query.eq("category", filters.category);
        if (filters.mode) query = query.eq("mode", filters.mode);
        if (filters.status) query = query.eq("status", filters.status);
        if (filters.city) query = query.ilike("city", `%${filters.city}%`);
        if (filters.ngo_id) query = query.eq("ngo_id", filters.ngo_id);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data || [];
    },

    // Get event by ID
    getById: async (id) => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Update event
    update: async (id, updates) => {
        const { data, error } = await supabase
            .from("events")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Delete event
    delete: async (id) => {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },

    // Get events by NGO
    getByNgo: async (ngoId) => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("ngo_id", ngoId)
            .order("event_date", { ascending: true });
        if (error) throw new Error(error.message);
        return data || [];
    },

    // ─── EVENT ROLES ──────────────────────────────────────────────

    // Create a role for an event
    createRole: async (roleData) => {
        const { data, error } = await supabase
            .from("event_roles")
            .insert(roleData)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Get all roles for an event
    getRolesByEvent: async (eventId) => {
        const { data, error } = await supabase
            .from("event_roles")
            .select("*")
            .eq("event_id", eventId);
        if (error) throw new Error(error.message);
        return data || [];
    },

    // Update a role
    updateRole: async (roleId, updates) => {
        const { data, error } = await supabase
            .from("event_roles")
            .update(updates)
            .eq("id", roleId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Delete a role
    deleteRole: async (roleId) => {
        const { error } = await supabase.from("event_roles").delete().eq("id", roleId);
        if (error) throw new Error(error.message);
    },

    // ─── EVENT REGISTRATIONS ──────────────────────────────────────

    // Register a volunteer for an event
    registerVolunteer: async (registrationData) => {
        const { data, error } = await supabase
            .from("event_registrations")
            .insert({ ...registrationData, status: 'pending' })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Get all registrations for an event
    getRegistrationsByEvent: async (eventId) => {
        const { data, error } = await supabase
            .from("event_registrations")
            .select("*, volunteers(id, name, email, phone, city)")
            .eq("event_id", eventId);
        if (error) throw new Error(error.message);
        return data || [];
    },

    // Get all registrations for all events of an NGO
    getRegistrationsByNGO: async (ngoId) => {
        // First get all event IDs for this NGO
        const { data: events, error: evError } = await supabase
            .from("events")
            .select("id")
            .eq("ngo_id", ngoId);
        
        if (evError) throw new Error(evError.message);
        if (!events || events.length === 0) return [];

        const eventIds = events.map(e => e.id);

        const { data, error } = await supabase
            .from("event_registrations")
            .select("*, volunteers(id, name, email, phone, city), events(id, title, category, event_date)")
            .in("event_id", eventIds);

        if (error) throw new Error(error.message);
        return data || [];
    },

    // Get all registrations by a volunteer
    getRegistrationsByVolunteer: async (volunteerId) => {
        const { data, error } = await supabase
            .from("event_registrations")
            .select("*, events(id, title, category, event_date, city, status)")
            .eq("volunteer_id", volunteerId);
        if (error) throw new Error(error.message);
        return data || [];
    },

    // Update registration status (approve/reject/waitlist)
    updateRegistrationStatus: async (registrationId, status) => {
        const { data, error } = await supabase
            .from("event_registrations")
            .update({ status })
            .eq("id", registrationId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    // Cancel registration
    cancelRegistration: async (eventId, volunteerId) => {
        const { error } = await supabase
            .from("event_registrations")
            .delete()
            .eq("event_id", eventId)
            .eq("volunteer_id", volunteerId);
        if (error) throw new Error(error.message);
    },

    // ─── ATTENDANCE (gamification) ────────────────────────────────

    createAttendance: async (volunteerId, eventId) => {
        const { data, error } = await supabase
            .from("attendance")
            .insert({ volunteer_id: volunteerId, event_id: eventId, verified: false })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    getAttendance: async (volunteerId, eventId) => {
        const { data } = await supabase
            .from("attendance")
            .select("*")
            .eq("volunteer_id", volunteerId)
            .eq("event_id", eventId)
            .single();
        return data;
    },

    verifyAttendance: async (volunteerId, eventId) => {
        const { data, error } = await supabase
            .from("attendance")
            .update({ verified: true })
            .eq("volunteer_id", volunteerId)
            .eq("event_id", eventId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    countEnvironmentEvents: async (volunteerId) => {
        const { data, error } = await supabase
            .from("attendance")
            .select("event_id, events!inner(category)")
            .eq("volunteer_id", volunteerId)
            .eq("verified", true)
            .eq("events.category", "environment");
        if (error) return 0;
        return (data || []).length;
    },
};
