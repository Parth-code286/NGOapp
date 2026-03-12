import supabase from "../config/supabaseClient.js";

export const inviteModel = {
  // Create a new invite (NGO invites Volunteer to Event)
  create: async (volunteerId, ngoId, eventId) => {
    // Prevent duplicate invites
    const { data: existing } = await supabase
      .from("volunteer_invites")
      .select("id")
      .eq("volunteer_id", volunteerId)
      .eq("event_id", eventId)
      .single();

    if (existing) {
      throw new Error("Volunteer is already invited to this event.");
    }

    const { data, error } = await supabase
      .from("volunteer_invites")
      .insert({
        volunteer_id: volunteerId,
        ngo_id: ngoId,
        event_id: eventId,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get all invites for a specific volunteer (with nested NGO and Event data)
  getByVolunteer: async (volunteerId) => {
    const { data, error } = await supabase
      .from("volunteer_invites")
      .select(`
        id, status, created_at,
        ngos ( id, name, official_email, phone, website ),
        events ( id, title, category, event_date, start_time, end_time, mode, venue_name, city, state, description )
      `)
      .eq("volunteer_id", volunteerId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  // Respond to invite (accept/decline)
  updateStatus: async (inviteId, newStatus) => {
    const { error } = await supabase
      .from("volunteer_invites")
      .update({ status: newStatus })
      .eq("id", inviteId);
    if (error) throw new Error(error.message);
  },

  // Get single invite with full details
  getById: async (id) => {
    const { data, error } = await supabase
      .from("volunteer_invites")
      .select(`
        id, volunteer_id, ngo_id, event_id, status,
        volunteers ( name ),
        events ( title )
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get all invites sent by a specific NGO (to see acceptance status)
  getByNGO: async (ngoId) => {
    const { data, error } = await supabase
      .from("volunteer_invites")
      .select(`
        id, status, created_at, volunteer_id, event_id,
        volunteers ( id, name, email, phone, city ),
        events ( id, title, category, event_date )
      `)
      .eq("ngo_id", ngoId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
};
