import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return {
      data: null,
      error: { message: "Supabase não configurado. Usando autenticação demonstrativa." }
    };
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  } catch {
    return {
      data: null,
      error: { message: "Login Google preparado para Supabase Auth." }
    };
  }
}

export async function sendPasswordRecovery(email: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
  } catch {
    return {
      data: null,
      error: null
    };
  }
}
