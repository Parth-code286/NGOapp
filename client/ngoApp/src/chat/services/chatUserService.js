import { supabase } from "../../lib/supabaseClient";

export const createChatUser = async (userType, userRefId, name) => {
  const { data: existing } = await supabase
    .from("chat_users")
    .select("*")
    .eq("user_ref_id", userRefId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("chat_users")
    .insert([
      {
        user_type: userType,
        user_ref_id: userRefId,
        name: name
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Chat user creation error:", error);
    return null;
  }

  return data;
};