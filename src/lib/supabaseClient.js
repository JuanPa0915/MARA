import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxoltcjvvkicrzewtdab.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4b2x0Y2p2dmtpY3J6ZXd0ZGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMyNDQsImV4cCI6MjA5Nzc5OTI0NH0.ZIR2vgpM-r7-QGJd9Z6w0e-02jJi6l6nPUYXn5unHbo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
