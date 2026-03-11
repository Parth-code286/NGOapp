import { supabase } from "../../lib/supabaseClient";

export const getMessages = async (conversationId) => {

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
};


export const sendMessage = async (conversationId, senderId, content) => {

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Send message error:", error);
    return null;
  }

  return data;
};