import supabase from "../config/supabaseClient.js";

export const notificationModel = {
  // Create a new notification
  create: async (data) => {
    const { error } = await supabase.from("notifications").insert(data);
    if (error) throw new Error(error.message);
  },

  // Get notifications for a user (Volunteer or NGO)
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  // Mark a single notification as read
  markAsRead: async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Mark all notifications for a user as read
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  // Delete a notification
  delete: async (id) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
};
