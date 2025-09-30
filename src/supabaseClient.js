// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dzqauwawbtxcdpouogyl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cWF1d2F3YnR4Y2Rwb3VvZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjc1NzEsImV4cCI6MjA3NDc0MzU3MX0.PsBKfNbta2HWQHw-Y-H3r4sRIhjfB3BNo3iQpYi-uAw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
