import supabase from "../config/supabaseClient.js";

export const certificateModel = {
  async create({ volunteer_id, ngo_id, event_id, certificate_url, issue_date }) {
    const { data, error } = await supabase
      .from("certificates")
      .insert([{
        volunteer_id,
        ngo_id,
        event_id,
        certificate_url,
        issue_date: issue_date || new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  async getByVolunteer(volunteerId) {
    const { data, error } = await supabase
      .from("certificates")
      .select(`
        *,
        ngos (name, logo_url),
        events (title, category)
      `)
      .eq("volunteer_id", volunteerId)
      .order("issue_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByNGO(ngoId) {
    const { data, error } = await supabase
      .from("certificates")
      .select(`
        *,
        volunteers (name, email),
        events (title)
      `)
      .eq("ngo_id", ngoId)
      .order("issue_date", { ascending: false });

    if (error) throw error;
    return data;
  }
};
