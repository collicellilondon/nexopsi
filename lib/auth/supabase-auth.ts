import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return {
      data: null,
      error: { message: "Supabase nao configurado. Verifique as variaveis de ambiente." }
    };
  }
}

export async function signUpWithEmail(email: string, password: string, activationCode: string) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, activationCode })
    });

    const payload = await response.json();
    if (!response.ok) {
      return {
        data: null,
        error: { message: payload?.error ?? "Nao foi possivel criar a conta agora." }
      };
    }

    return {
      data: payload.data ?? null,
      error: null
    };
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel criar a conta agora." }
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
