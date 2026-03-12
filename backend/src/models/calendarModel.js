import supabase from "../config/supabaseClient.js";

export const calendarModel = {
  // Get all availability entries for a volunteer
  getAvailability: async (volunteerId) => {
    const { data, error } = await supabase
      .from("volunteer_availability")
      .select("*")
      .eq("volunteer_id", volunteerId)
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Upsert a single date's availability (insert or update)
  setAvailability: async (volunteerId, date, status, reason = null) => {
    // Try update first
    const { data: existing } = await supabase
      .from("volunteer_availability")
      .select("id")
      .eq("volunteer_id", volunteerId)
      .eq("date", date)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("volunteer_availability")
        .update({ status, reason })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const { data, error } = await supabase
      .from("volunteer_availability")
      .insert({ volunteer_id: volunteerId, date, status, reason })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  // Bulk upsert availability entries
  bulkSet: async (volunteerId, entries) => {
    // entries = [{date, status, reason}]
    const results = [];
    for (const entry of entries) {
      const result = await calendarModel.setAvailability(
        volunteerId, entry.date, entry.status, entry.reason || null
      );
      results.push(result);
    }
    return results;
  },

  // Delete a specific availability entry (resets to default)
  removeAvailability: async (volunteerId, date) => {
    const { error } = await supabase
      .from("volunteer_availability")
      .delete()
      .eq("volunteer_id", volunteerId)
      .eq("date", date);
    if (error) throw new Error(error.message);
  },

  // Get registered events for a volunteer (with event details)
  getRegisteredEvents: async (volunteerId) => {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*, events(id, title, category, event_date, start_time, end_time, city, mode)")
      .eq("volunteer_id", volunteerId)
      .in("status", ["pending", "approved"]);
    if (error) throw new Error(error.message);
    return data || [];
  },
};
