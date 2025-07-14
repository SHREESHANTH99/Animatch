
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pzecswmzijxyzlcfvqwd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZWNzd216aWp4eXpsY2Z2cXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzOTgyMzYsImV4cCI6MjA2Nzk3NDIzNn0.eQqomkf-ks_8pWWPyR8utwmepTaCLO7mR6Y_8NzYAUo'
export const supabase = createClient(supabaseUrl, supabaseKey)