// Connection details for the shared (2-person) Supabase backend.
//
// The anon key below is meant to be public — it's the client-side key that
// ships in the page source for every Supabase project, and it only grants
// whatever the Row Level Security policies in supabase/schema.sql allow.
// It is NOT the service_role key (which must never appear in client code).
const SUPABASE_URL = "https://wjrhmfrxzaotsolpqaqp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcmhtZnJ4emFvdHNvbHBxYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTcyNDEsImV4cCI6MjEwNTMzMzI0MX0.YMMLSVGP9Z6dtNQao_oJAhuMcto40ejMGsgVQhFLK4c";

// Usernames are turned into a fake email under this domain before being
// handed to Supabase Auth (which only speaks email/password) — the app's
// login screen never shows or asks for an email at all.
const USERNAME_EMAIL_DOMAIN = "sketchbook.local";

// Storage bucket that holds practice-log sketch photos.
const SKETCHES_BUCKET = "sketches";
