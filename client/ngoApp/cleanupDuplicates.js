import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wxmicrswfeudfuocserp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0"
);

async function cleanup() {
  // 1. Get all users
  const { data: allUsers } = await supabase.from("chat_users").select("*").order("created_at");

  // 2. Find IDs referenced in conversation_participants
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("chat_user_id");
  const referencedInParts = new Set((participantRows || []).map(r => r.chat_user_id));

  // 3. Find IDs referenced in conversations.created_by
  const { data: convoRows } = await supabase
    .from("conversations")
    .select("created_by");
  const referencedInConvos = new Set((convoRows || []).map(r => r.created_by).filter(Boolean));

  const allReferenced = new Set([...referencedInParts, ...referencedInConvos]);
  console.log("Referenced IDs:", [...allReferenced]);

  // 4. Among duplicates (same user_ref_id), keep the "canonical" one (id === user_ref_id), 
  //    or if referenced, keep that one instead.
  const keepIds = new Set();
  const byRef = {};

  for (const u of allUsers) {
    if (!byRef[u.user_ref_id]) byRef[u.user_ref_id] = [];
    byRef[u.user_ref_id].push(u);
  }

  const toDelete = [];
  for (const [refId, group] of Object.entries(byRef)) {
    if (group.length === 1) {
      keepIds.add(group[0].id);
      continue;
    }
    // Prefer the canonical (id === user_ref_id)
    const canonical = group.find(u => u.id === u.user_ref_id);
    // Must also keep any that are referenced (can't delete them)
    const referenced = group.filter(u => allReferenced.has(u.id));

    const keepers = new Set();
    if (canonical) keepers.add(canonical.id);
    referenced.forEach(u => keepers.add(u.id));
    if (keepers.size === 0) keepers.add(group[0].id); // fallback

    for (const u of group) {
      if (keepers.has(u.id)) {
        keepIds.add(u.id);
      } else {
        toDelete.push(u.id);
      }
    }
  }

  console.log(`Will keep ${keepIds.size} rows, delete ${toDelete.length} rows`);

  // 5. Delete in batches of 5 to avoid FK issues
  let deleted = 0;
  for (const id of toDelete) {
    const { error } = await supabase.from("chat_users").delete().eq("id", id);
    if (error) {
      console.warn(`  Could not delete ${id}: ${error.message}`);
    } else {
      deleted++;
    }
  }

  console.log(`✅ Deleted ${deleted} duplicate rows.`);

  // 6. Verify final state
  const { data: final } = await supabase.from("chat_users").select("id, name, user_type, user_ref_id");
  console.log("Remaining users:");
  final.forEach(u => console.log(`  ${u.name} (${u.user_type}) → id: ${u.id}`));
}

cleanup();
