import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";

const supabase = createClient(supabaseUrl, supabaseKey);

// Real users to seed — adjust user_type as needed
const usersToSeed = [
  { name: "Ritesh", user_type: "volunteer", email: "ritesh@ngo.com" },
  { name: "Aman",   user_type: "ngo",       email: "aman@ngo.com"   },
  { name: "Rahul",  user_type: "volunteer", email: "rahul@ngo.com"  },
];

async function seed() {
  for (const u of usersToSeed) {
    // Check if already exists by name
    const { data: existing } = await supabase
      .from("chat_users")
      .select("id, name")
      .eq("name", u.name)
      .maybeSingle();

    if (existing) {
      console.log(`✅ Already exists: ${u.name} (id: ${existing.id})`);
      continue;
    }

    const { data, error } = await supabase
      .from("chat_users")
      .insert({ name: u.name, user_type: u.user_type })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to insert ${u.name}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${data.name} (${data.user_type}) — id: ${data.id}`);
    }
  }
  console.log("\nDone!");
}

seed();
