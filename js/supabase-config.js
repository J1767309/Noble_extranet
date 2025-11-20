// Supabase Configuration
// Get these values from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase project credentials
const supabaseUrl = 'https://gfsusmsstpjqwrvcxjzt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc3VzbXNzdHBqcXdydmN4anp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzY4MDIsImV4cCI6MjA3OTE1MjgwMn0.BQaUgWgo0FpkucdbM-1-DWLRE1TJE8BOoDKFRt9yI_4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
