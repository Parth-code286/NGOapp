import { supabase } from "../../lib/supabaseClient";

export const getOrCreate1on1Conversation = async (user1Id, user2Id) => {
  // 1. Find existing conversations for user1
  const { data: user1Convos, error: err1 } = await supabase
    .from("conversation_participants")
    .select(`conversation_id, conversations(is_group)`)
    .eq("chat_user_id", user1Id);

  if (err1) {
    console.error("Error fetching user1 convos:", err1);
    return null;
  }

  // Filter to only 1-on-1 (not group)
  const candidateConvoIds = user1Convos
    .filter((p) => p.conversations && !p.conversations.is_group)
    .map((p) => p.conversation_id);

  if (candidateConvoIds.length > 0) {
    // 2. Check if user2 is in any of these
    const { data: user2Convos, error: err2 } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("chat_user_id", user2Id)
      .in("conversation_id", candidateConvoIds);

    if (err2) {
      console.error("Error fetching user2 convos:", err2);
      return null;
    }

    if (user2Convos && user2Convos.length > 0) {
      // Return the existing conversation ID
      return user2Convos[0].conversation_id;
    }
  }

  // 3. If none exists, create a new conversation
  const { data: newConvo, error: createErr } = await supabase
    .from("conversations")
    .insert([{ created_by: user1Id, is_group: false }])
    .select()
    .single();

  if (createErr) {
    console.error("Error creating conversation:", createErr);
    return null;
  }

  // 4. Add both participants
  const { error: partErr } = await supabase.from("conversation_participants").insert([
    { conversation_id: newConvo.id, chat_user_id: user1Id },
    { conversation_id: newConvo.id, chat_user_id: user2Id }
  ]);

  if (partErr) {
    console.error("Error adding participants:", partErr);
  }

  return newConvo.id;
};

export const getOrCreateGroupConversation = async () => {
  // 1. Find if the Volunteer & Admin group chat already exists
  const { data: groupConvos, error: groupErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("is_group", true)
    .limit(1);

  if (groupErr) {
    console.error("Error finding group chat:", groupErr);
    return null;
  }

  if (groupConvos && groupConvos.length > 0) {
    return groupConvos[0].id;
  }

  // 2. Create it if it doesn't exist
  const { data: newGroup, error: createErr } = await supabase
    .from("conversations")
    .insert([{ is_group: true }])
    .select()
    .single();

  if (createErr) {
    console.error("Error creating group chat:", createErr);
    return null;
  }

  return newGroup.id;
};