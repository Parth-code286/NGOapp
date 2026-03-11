import { supabase } from "../../lib/supabaseClient";

export const createConversation = async (user1, user2) => {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert([{ created_by: user1 }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  const conversationId = conversation.id;

  await supabase.from("conversation_participants").insert([
    { conversation_id: conversationId, chat_user_id: user1 },
    { conversation_id: conversationId, chat_user_id: user2 }
  ]);

  return conversation;
};