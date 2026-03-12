import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";

const supabase = createClient(supabaseUrl, supabaseKey);

// These are the FAKE hardcoded UUIDs from the old seeding
const FAKE_IDS = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
  "33333333-3333-3333-3333-333333333333",
];

async function cleanup() {
  // Show current state first
  const { data: all } = await supabase
    .from("chat_users")
    .select("id, name, user_type, user_ref_id")
    .order("name");

  console.log(`Total chat_users now: ${all?.length ?? 0}`);
  if (all) {
    for (const u of all) {
      const isFake = FAKE_IDS.includes(u.user_ref_id) || FAKE_IDS.includes(u.id);
      console.log(`  ${isFake ? "❌ FAKE" : "✅     "} ${u.name} (${u.user_type}) — ref: ${u.user_ref_id}`);
    }
  }

  // Delete fake rows
  const { error } = await supabase
    .from("chat_users")
    .delete()
    .in("id", FAKE_IDS);

  if (error) {
    console.log("\nNote: Could not delete fake rows:", error.message);
    console.log("You may need to delete them manually from the Supabase dashboard.");
  } else {
    console.log("\n🗑  Deleted old fake rows (Ritesh/Aman/Rahul with hardcoded UUIDs)");
  }
}

cleanup();
