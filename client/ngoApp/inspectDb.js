import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: convs } = await supabase.from("conversations").select("*").limit(1);
  console.log("Conversations:", convs ? Object.keys(convs[0] || {}) : "No data");

  const { data: parts } = await supabase.from("conversation_participants").select("*").limit(1);
  console.log("Participants:", parts ? Object.keys(parts[0] || {}) : "No data");

  const { data: msgs } = await supabase.from("messages").select("*").limit(1);
  console.log("Messages:", msgs ? Object.keys(msgs[0] || {}) : "No data");
  
  const { data: users } = await supabase.from("chat_users").select("*").limit(1);
  console.log("Users:", users ? Object.keys(users[0] || {}) : "No data");
}

inspect();
