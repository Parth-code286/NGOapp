import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Check chat_users
  const { data: chatUsers } = await supabase
    .from("chat_users")
    .select("id, name, user_type, user_ref_id");
  console.log("=== chat_users ===");
  console.log(JSON.stringify(chatUsers, null, 2));

  // Check volunteers
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, name, email")
    .limit(5);
  console.log("\n=== volunteers (first 5) ===");
  console.log(JSON.stringify(volunteers, null, 2));

  // Check ngos
  const { data: ngos } = await supabase
    .from("ngos")
    .select("id, name, email")
    .limit(5);
  console.log("\n=== ngos (first 5) ===");
  console.log(JSON.stringify(ngos, null, 2));
}

check();
