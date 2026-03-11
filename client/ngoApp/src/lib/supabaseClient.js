import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wxmicrswfeudfuocserp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bWljcnN3ZmV1ZGZ1b2NzZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjg1NDAsImV4cCI6MjA4ODgwNDU0MH0.mvbDRPDC3FCdOzV_WCCoZIgBZjvMxzNZ6R2oZl8osv0";

export const supabase = createClient(supabaseUrl, supabaseKey);