import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return {
      data: null,
      error: { message: "Supabase não configurado. Verifique as variáveis de ambiente." }
    };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
  } catch {
    return {
      data: null,
      error: { message: "Não foi possível criar a conta agora." }
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
      error: { message: "Login com Google indisponível no momento." }
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
