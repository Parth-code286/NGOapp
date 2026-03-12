import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUsers() {
  // --- 1. Fetch all volunteers ---
  const { data: volunteers, error: vErr } = await supabase
    .from("volunteers")
    .select("id, name");
  if (vErr) console.error("volunteers error:", vErr.message);

  // --- 2. Fetch all NGOs ---
  const { data: ngos, error: nErr } = await supabase
    .from("ngos")
    .select("id, name");
  if (nErr) console.error("ngos error:", nErr.message);

  // --- 3. Get existing chat_users ---
  const { data: existingChatUsers } = await supabase
    .from("chat_users")
    .select("user_ref_id");
  const existingRefs = new Set((existingChatUsers || []).map((u) => u.user_ref_id));

  const toInsert = [];

  for (const v of volunteers || []) {
    if (!existingRefs.has(v.id)) {
      toInsert.push({ name: v.name, user_type: "volunteer", user_ref_id: v.id });
    } else {
      console.log(`⏭  Already in chat_users: ${v.name} (volunteer)`);
    }
  }

  for (const n of ngos || []) {
    if (!existingRefs.has(n.id)) {
      toInsert.push({ name: n.name, user_type: "ngo", user_ref_id: n.id });
    } else {
      console.log(`⏭  Already in chat_users: ${n.name} (ngo)`);
    }
  }

  if (toInsert.length === 0) {
    console.log("✅ All users already synced — nothing to insert.");
    return;
  }

  console.log(`\nInserting ${toInsert.length} new chat_users...`);
  const { data: inserted, error: insertErr } = await supabase
    .from("chat_users")
    .insert(toInsert)
    .select("id, name, user_type");

  if (insertErr) {
    console.error("❌ Insert error:", insertErr.message);
  } else {
    for (const u of inserted || []) {
      console.log(`✅ Inserted: ${u.name} (${u.user_type}) — id: ${u.id}`);
    }
  }

  console.log("\n🎉 Sync complete!");
}

syncUsers();
