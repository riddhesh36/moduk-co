import { createClient } from "@supabase/supabase-js";

// Mock environment variables for local compilation without actual keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-xyz.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Usage:
// Because this is a mock for phase 1 development without keys, 
// database operations will fail or return empty if live query is executed.
// We use fallback constants where necessary to allow UI inspection.
