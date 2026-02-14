import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://boeyvbntohuhnojjsnpv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZXl2Ym50b2h1aG5vampzbnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjQ3MzcsImV4cCI6MjA4NjY0MDczN30.gHmcPJFQJTh7vUvrShuU3L3YLRqubjJELa8olCmL0wc';

export const supabase = createClient(supabaseUrl, supabaseKey);
