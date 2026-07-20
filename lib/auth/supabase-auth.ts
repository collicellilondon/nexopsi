import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const defaultAppUrl = "https://nexopsi.app.br";

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
      redirectTo: `${getAppUrl()}/login?modo=redefinir-senha`
    });
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel enviar o email de redefinicao. Verifique o SMTP no Supabase." }
    };
  }
}

export async function updatePassword(password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.updateUser({ password });
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel redefinir a senha agora." }
    };
  }
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || window.location.origin || defaultAppUrl).replace(/\/$/, "");
}
