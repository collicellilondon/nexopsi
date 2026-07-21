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

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      return {
        data: null,
        error: { message: readPayloadError(payload) }
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

function readPayloadError(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Nao foi possivel criar a conta agora.";
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      return "Nao foi possivel ler o erro retornado pelo servidor.";
    }
  }
  return "O servidor recusou o cadastro sem mensagem detalhada. Verifique os logs do Supabase Auth.";
}

async function readJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return { error: `Resposta inesperada do servidor (${response.status}).` };
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
