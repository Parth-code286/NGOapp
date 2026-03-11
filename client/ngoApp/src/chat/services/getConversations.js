import { supabase } from "../../lib/supabaseClient";

export const getConversations = async (chatUserId) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      conversations (
        id,
        created_at
      )
    `)
    .eq("chat_user_id", chatUserId);

  if (error) {
    console.error("Conversation fetch error:", error);
    return [];
  }

  return data;
};