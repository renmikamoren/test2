const SUPABASE_URL = "https://mipivcdyyptrvyvwjrpa.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcGl2Y2R5eXB0cnZ5dndqcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDAyMDYsImV4cCI6MjA5NTg3NjIwNn0.-0bdeoPQxBDX-ednAhuuqsIs7aibLuv7Pkd4xSMrRmU";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);