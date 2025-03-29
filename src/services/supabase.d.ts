import { SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    File: typeof File;
  }
}

declare module '../services/supabase' {
  export const supabase: SupabaseClient
}
