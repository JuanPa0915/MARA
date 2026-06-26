import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxoltcjvvkicrzewtdab.supabase.co'
const supabaseAnonKey = 'sb_publishable_d9gH8bV1HOj6h5T9J6zHvQ_FX3FtPFE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
