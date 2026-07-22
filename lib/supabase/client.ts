import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// O projeto ainda nao tem tipos gerados do Supabase; manter o client permissivo evita
// que tabelas/RPCs dinamicas sejam inferidas como `never` pelo TypeScript.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browserClient: any = null;

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "nexopsi-supabase-auth"
      }
    });
  }

  return browserClient;
}
